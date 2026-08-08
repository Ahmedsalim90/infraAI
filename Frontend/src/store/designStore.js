import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "reactflow";

const H_SPACING = 260;
const V_SPACING = 140;

function autoLayout(nodes, edges) {
  const incoming = new Map();
  const adjacency = new Map();
  nodes.forEach((n) => {
    incoming.set(n.id, 0);
    adjacency.set(n.id, []);
  });
  edges.forEach((e) => {
    if (adjacency.has(e.from)) adjacency.get(e.from).push(e.to);
    if (incoming.has(e.to)) incoming.set(e.to, (incoming.get(e.to) || 0) + 1);
  });

  const roots = nodes.filter((n) => incoming.get(n.id) === 0).map((n) => n.id);
  const startIds = roots.length ? roots : nodes.slice(0, 1).map((n) => n.id);

  const layer = new Map();
  const visited = new Set(startIds);
  let queue = startIds.map((id) => ({ id, depth: 0 }));

  while (queue.length) {
    const { id, depth } = queue.shift();
    layer.set(id, Math.max(layer.get(id) ?? 0, depth));
    (adjacency.get(id) || []).forEach((next) => {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push({ id: next, depth: depth + 1 });
      } else {
        layer.set(next, Math.max(layer.get(next) ?? 0, depth + 1));
      }
    });
  }

  let maxLayer = 0;
  layer.forEach((v) => { if (v > maxLayer) maxLayer = v; });
  nodes.forEach((n) => {
    if (!layer.has(n.id)) {
      maxLayer += 1;
      layer.set(n.id, maxLayer);
    }
  });

  const columnCounters = new Map();
  return nodes.map((n) => {
    const l = layer.get(n.id) ?? 0;
    const col = columnCounters.get(l) ?? 0;
    columnCounters.set(l, col + 1);
    return {
      id: n.id,
      type: "service",
      position: { x: col * H_SPACING, y: l * V_SPACING },
      data: { label: n.label || n.id, serviceType: n.type || "default" },
    };
  });
}

function toReactFlowEdges(edges) {
  return edges.map((e, i) => ({
    id: `e-${e.from}-${e.to}-${i}`,
    source: e.from,
    target: e.to,
    type: "labeled",
    data: { label: e.label || "connects to" },
  }));
}

let nodeIdCounter = 1000;

export const useDesignStore = create((set, get) => ({
  nodes: [],
  edges: [],

  setDesignFromBackend: (design) => {
    const backendNodes = design?.nodes || [];
    const backendEdges = design?.edges || [];
    const existing = get().nodes;
    const existingPositions = new Map(existing.map((n) => [n.id, n.position]));

    const laidOut = autoLayout(backendNodes, backendEdges);
    const nodes = laidOut.map((n) =>
      existingPositions.has(n.id) ? { ...n, position: existingPositions.get(n.id) } : n
    );
    const edges = toReactFlowEdges(backendEdges);

    set({ nodes, edges });
  },

  toBackendFormat: () => {
    const { nodes, edges } = get();
    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data?.serviceType || "default",
        label: n.data?.label || n.id,
      })),
      edges: edges.map((e) => ({
        from: e.source,
        to: e.target,
        label: e.data?.label || "connects to",
      })),
    };
  },

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, type: "labeled", data: { label: "connects to" } }, get().edges),
    });
  },

  addNode: (serviceType, label) => {
    nodeIdCounter += 1;
    const id = `n${nodeIdCounter}`;
    const { nodes } = get();
    const offset = nodes.length * 40;
    const newNode = {
      id,
      type: "service",
      position: { x: 100 + (offset % 400), y: 100 + Math.floor(offset / 400) * 120 },
      data: { label: label || serviceType, serviceType },
    };
    set({ nodes: [...nodes, newNode] });
    return id;
  },

  updateNodeLabel: (id, label) => {
    set({
      nodes: get().nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n)),
    });
  },

  updateEdgeLabel: (id, label) => {
    set({
      edges: get().edges.map((e) => (e.id === id ? { ...e, data: { ...e.data, label } } : e)),
    });
  },

  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
    });
  },

  clear: () => set({ nodes: [], edges: [] }),
}));
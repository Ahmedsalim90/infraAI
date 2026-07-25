import { create } from 'zustand'

const useDesignStore = create((set, get) => ({
  nodes: [],
  edges: [],

  // --- Node actions ---
  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),

  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
    })),

  setNodes: (nodes) => set({ nodes }),

  // --- Edge actions ---
  addEdge: (edge) =>
    set((state) => ({ edges: [...state.edges, edge] })),

  removeEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    })),

  setEdges: (edges) => set({ edges }),

  // --- Position updates (used by reactflow drag events) ---
  updateNodePosition: (id, position) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, position } : node
      ),
    })),

  // --- Reset / load a full design (useful for loading saved designs later) ---
  loadDesign: ({ nodes, edges }) => set({ nodes, edges }),

  clearCanvas: () => set({ nodes: [], edges: [] }),
}))

export default useDesignStore
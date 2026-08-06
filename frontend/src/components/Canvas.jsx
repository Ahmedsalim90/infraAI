import { useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow'
import 'reactflow/dist/style.css'
import useDesignStore from '../store/designStore'
import ServiceNode from './ServiceNode'

const nodeTypes = { serviceNode: ServiceNode }

// Hardcoded mock data matching the frozen schema — swap for real data from Pod C later
const MOCK_NODES = [
  {
    id: 'node-1',
    type: 'serviceNode',
    position: { x: 100, y: 100 },
    data: { serviceType: 'EC2', label: 'Web Server', config: {} },
  },
  {
    id: 'node-2',
    type: 'serviceNode',
    position: { x: 400, y: 100 },
    data: { serviceType: 'Database', label: 'Primary DB', config: {} },
  },
  {
    id: 'node-3',
    type: 'serviceNode',
    position: { x: 250, y: 280 },
    data: { serviceType: 'S3', label: 'Asset Storage', config: {} },
  },
]

const MOCK_EDGES = [
  { id: 'edge-1', source: 'node-1', target: 'node-2', label: 'reads/writes' },
  { id: 'edge-2', source: 'node-1', target: 'node-3', label: 'uploads to' },
]

function Canvas() {
  const nodes = useDesignStore((state) => state.nodes)
  const edges = useDesignStore((state) => state.edges)
  const setNodes = useDesignStore((state) => state.setNodes)
  const setEdges = useDesignStore((state) => state.setEdges)
  const updateNodePosition = useDesignStore((state) => state.updateNodePosition)

  useEffect(() => {
    setNodes(MOCK_NODES)
    setEdges(MOCK_EDGES)
  }, [setNodes, setEdges])

  const onNodesChange = useCallback(
    (changes) => {
      const updated = applyNodeChanges(changes, nodes)
      setNodes(updated)
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateNodePosition(change.id, change.position)
        }
      })
    },
    [nodes, setNodes, updateNodePosition]
  )

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges(applyEdgeChanges(changes, edges))
    },
    [edges, setEdges]
  )

  return (
   <div className="w-full h-full bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={{
          style: { stroke: '#38bdf8', strokeWidth: 1.5 },
          labelStyle: { fill: '#cbd5e1', fontSize: 11 },
          labelBgStyle: { fill: '#0f172a' },
        }}
      >
        <Background color="#334155" gap={20} />
        <Controls className="!bg-slate-900 !border-slate-700 [&>button]:!bg-slate-900 [&>button]:!border-slate-700 [&>button]:!text-slate-300" />
        <MiniMap
          className="!bg-slate-900"
          maskColor="rgba(15, 23, 42, 0.6)"
          nodeColor="#38bdf8"
        />
      </ReactFlow>
    </div>
  )
}

export default Canvas
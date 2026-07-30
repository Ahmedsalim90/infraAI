import { useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'

import useDesignStore from '../store/designStore'
import ServiceNode from './ServiceNode'
import Palette from './Palette'

const nodeTypes = { serviceNode: ServiceNode }

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
  const addNode = useDesignStore((state) => state.addNode)
  const updateNodePosition = useDesignStore((state) => state.updateNodePosition)

  const reactFlowWrapper = useRef(null)
  const { screenToFlowPosition } = useReactFlow()

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

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      const serviceType = event.dataTransfer.getData('application/reactflow')
      if (!serviceType) return

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode = {
        id: `node-${Date.now()}`,
        type: 'serviceNode',
        position,
        data: { serviceType, label: serviceType, config: {} },
      }

      addNode(newNode)
    },
    [screenToFlowPosition, addNode]
  )

  return (
    <div className="flex">
      <Palette />
      <div
        className="w-full h-screen"
        ref={reactFlowWrapper}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}

export default Canvas
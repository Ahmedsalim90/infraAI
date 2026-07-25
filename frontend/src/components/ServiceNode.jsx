import { Handle, Position } from 'reactflow'

// Visual config per service type — extend this as new service types are added
const SERVICE_CONFIG = {
  EC2: { label: 'EC2', color: 'bg-orange-100 border-orange-400 text-orange-800', icon: '🖥️' },
  S3: { label: 'S3', color: 'bg-green-100 border-green-400 text-green-800', icon: '🪣' },
  Database: { label: 'Database', color: 'bg-blue-100 border-blue-400 text-blue-800', icon: '🗄️' },
  Lambda: { label: 'Lambda', color: 'bg-purple-100 border-purple-400 text-purple-800', icon: 'λ' },
  LoadBalancer: { label: 'Load Balancer', color: 'bg-yellow-100 border-yellow-400 text-yellow-800', icon: '⚖️' },
  Default: { label: 'Service', color: 'bg-gray-100 border-gray-400 text-gray-800', icon: '⬛' },
}

function ServiceNode({ data }) {
  const config = SERVICE_CONFIG[data.serviceType] || SERVICE_CONFIG.Default

  return (
    <div className={`rounded-lg border-2 shadow-md px-4 py-3 min-w-[140px] ${config.color}`}>
      {/* Connection handles - allow edges in/out of any side */}
      <Handle type="target" position={Position.Top} className="!bg-gray-500" />

      <div className="flex items-center gap-2">
        <span className="text-lg">{config.icon}</span>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
            {config.label}
          </div>
          <div className="text-sm font-medium">
            {data.label || 'Untitled'}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-500" />
    </div>
  )
}

export default ServiceNode
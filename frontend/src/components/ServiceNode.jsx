import { Handle, Position } from 'reactflow'

// Visual config per service type — extend this as new service types are added
const SERVICE_CONFIG = {
  EC2: { label: 'EDGE', color: 'border-orange-400/50 ring-orange-400/20', icon: '🖥️' },
  S3: { label: 'STORE', color: 'border-green-400/50 ring-green-400/20', icon: '🪣' },
  Database: { label: 'STORE', color: 'border-blue-400/50 ring-blue-400/20', icon: '🗄️' },
  Lambda: { label: 'COMPUTE', color: 'border-purple-400/50 ring-purple-400/20', icon: 'λ' },
  LoadBalancer: { label: 'EDGE', color: 'border-yellow-400/50 ring-yellow-400/20', icon: '⚖️' },
  Default: { label: 'SERVICE', color: 'border-slate-500/50 ring-slate-500/20', icon: '⬛' },
}

function ServiceNode({ data }) {
  const config = SERVICE_CONFIG[data.serviceType] || SERVICE_CONFIG.Default

  return (
    <div
      className={`rounded-xl border bg-slate-900/90 backdrop-blur px-3.5 py-3 min-w-[160px] shadow-lg ring-1 ${config.color}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-500" />

      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
        {config.label}
      </div>
      <div className="text-sm font-semibold mt-0.5 text-slate-100 flex items-center gap-1.5">
        <span>{config.icon}</span>
        {data.label || 'Untitled'}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="text-[10px] font-mono text-slate-400">healthy · 3 replicas</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-slate-500" />
    </div>
  )
}

export default ServiceNode
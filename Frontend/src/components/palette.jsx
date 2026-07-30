// src/components/Palette.jsx
const SERVICES = [
  { type: 'EC2', label: 'EC2', icon: '🖥️' },
  { type: 'S3', label: 'S3', icon: '🪣' },
  { type: 'Database', label: 'Database', icon: '🗄️' },
  { type: 'Lambda', label: 'Lambda', icon: 'λ' },
  { type: 'LoadBalancer', label: 'Load Balancer', icon: '⚖️' },
]

function Palette() {
  const onDragStart = (event, serviceType) => {
    event.dataTransfer.setData('application/reactflow', serviceType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="p-3 w-48 border-r h-screen bg-white">
      <h3 className="text-sm font-semibold mb-3 uppercase text-gray-500">Services</h3>
      {SERVICES.map((service) => (
        <div
          key={service.type}
          draggable
          onDragStart={(e) => onDragStart(e, service.type)}
          className="flex items-center gap-2 p-2 mb-2 border rounded cursor-grab bg-gray-50 hover:bg-gray-100"
        >
          <span>{service.icon}</span>
          <span className="text-sm">{service.label}</span>
        </div>
      ))}
    </div>
  )
}

export default Palette
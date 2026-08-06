export function Logo({ className }) {
  return (
    <div className={`flex items-center gap-2 font-bold text-lg ${className || ""}`}>
      <span className="text-primary">infra</span>AI
    </div>
  );
}
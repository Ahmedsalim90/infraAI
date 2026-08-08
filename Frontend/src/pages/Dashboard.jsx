import { AppShell, StatCard, DateChip } from "@/components/AppShell";
import { Boxes, GitBranch, FileText, Sparkles, ShieldCheck, MessageSquare, Activity, ArrowUpRight, Cpu } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// Weekly design activity: components placed on canvas, ADRs/diagrams generated,
// and AI-assisted refinements (prompts that mutated an architecture).
const usage = [
  { day: "Mon", components: 14, docs: 6, ai: 22 },
  { day: "Tue", components: 22, docs: 9, ai: 31 },
  { day: "Wed", components: 9, docs: 4, ai: 14 },
  { day: "Thu", components: 28, docs: 11, ai: 38 },
  { day: "Fri", components: 18, docs: 7, ai: 24 },
  { day: "Sat", components: 5, docs: 2, ai: 8 },
  { day: "Sun", components: 3, docs: 1, ai: 5 },
];

const activities = [
  { icon: Sparkles, text: "AI generated topology · 12 services, 3 data stores for payments-api", time: "12m ago", tag: "AI" },
  { icon: FileText, text: "ADR-004 · Event-sourcing store — auto-documented from canvas", time: "1h ago", tag: "Doc" },
  { icon: ShieldCheck, text: "Validation passed · no single point of failure in checkout-mesh", time: "2h ago", tag: "Check" },
  { icon: GitBranch, text: "Exported checkout-mesh/v3 → Terraform + C4 diagrams", time: "3h ago", tag: "Export" },
  { icon: Cpu, text: "AI refined caching layer → added Redis cluster + read replicas", time: "Yesterday", tag: "AI" },
];

const comments = [
  { user: "Priya", text: "Split auth before the migration — I'll open an ADR.", project: "checkout-mesh" },
  { user: "Marcus", text: "Kafka partitioning by user_id looks safe. Approved.", project: "realtime-gw" },
  { user: "Zara", text: "Failover path documented on the diagram 👇", project: "edge-cdn" },
];

export default function Dashboard() {
  return (
    <AppShell
      title="Welcome back, Alchemist"
      subtitle="Here's what's happening across your architecture designs today."
      actions={<DateChip date="Sun · 19 Jul 2026" />}
      searchPlaceholder="Search architectures, components, ADRs…"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Boxes} value={12} label="Active architectures" />
        <StatCard icon={Cpu} value={187} label="Components designed" accent="success" />
        <StatCard icon={FileText} value={34} label="ADRs & diagrams" accent="muted" />
        <StatCard icon={Sparkles} value={142} label="AI generations · 30d" accent="warning" />
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Design activity</h2>
              <p className="text-sm text-muted-foreground">Components placed, docs generated & AI refinements</p>
            </div>
            <select className="h-9 rounded-lg bg-surface border border-border px-3 text-sm">
              <option>This week</option>
              <option>Last week</option>
              <option>This month</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usage} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gAi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.14 225)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.78 0.14 225)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDoc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.16 155)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.72 0.16 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.35 0.04 250 / 0.3)" vertical={false} />
                <XAxis dataKey="day" stroke="oklch(0.7 0.03 240)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.7 0.03 240)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.21 0.035 250)",
                    border: "1px solid oklch(0.4 0.05 240)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="ai" stroke="oklch(0.78 0.14 225)" strokeWidth={2} fill="url(#gAi)" />
                <Area type="monotone" dataKey="components" stroke="oklch(0.72 0.16 155)" strokeWidth={2} fill="url(#gDoc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Architecture patterns</h2>
          <p className="text-xs text-muted-foreground -mt-3 mb-4">Share of your active designs</p>
          <ul className="space-y-4">
            {[
              { label: "Microservices", pct: 42, color: "oklch(0.78 0.14 225)" },
              { label: "Event-driven", pct: 24, color: "oklch(0.86 0.12 200)" },
              { label: "Serverless", pct: 15, color: "oklch(0.72 0.16 155)" },
              { label: "Monolith / modular", pct: 11, color: "oklch(0.55 0.15 260)" },
              { label: "Data platform", pct: 8, color: "oklch(0.6 0.05 240)" },
            ].map((r) => (
              <li key={r.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                    {r.label}
                  </span>
                  <span className="font-mono text-muted-foreground">{r.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Recent activity
            </h2>
            <button className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <ul className="divide-y divide-border">
            {activities.map((a, i) => (
              <li key={i} className="flex items-center gap-4 py-3">
                <div className="h-9 w-9 rounded-lg bg-surface-2 grid place-items-center text-primary shrink-0">
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md bg-primary/10 text-primary">{a.tag}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <MessageSquare className="h-4 w-4 text-primary" /> Recent comments
          </h2>
          <ul className="space-y-4">
            {comments.map((c, i) => (
              <li key={i} className="rounded-xl bg-surface p-4 border border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                  <span className="h-6 w-6 rounded-full bg-primary/20 text-primary grid place-items-center text-[11px] font-semibold">{c.user[0]}</span>
                  <span className="font-medium text-foreground">{c.user}</span>
                  <span>·</span>
                  <span className="font-mono">{c.project}</span>
                </div>
                <p className="text-sm text-foreground/90">{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}

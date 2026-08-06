import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Sparkles, Users, Layers, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <header className="flex items-center justify-between px-6 lg:px-12 py-6">
        <Logo className="h-9" />
        <nav className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
            Sign in
          </Link>
          <Link
            to="/register"
            className="h-10 px-4 inline-flex items-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="relative px-6 lg:px-12 pt-16 pb-24 text-center">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />

        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-primary mb-4">
            AI-Powered Architecture Design
          </span>
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
            Design systems together, <span className="text-gradient">at the speed of thought</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            infraAI turns plain-language prompts into live architecture diagrams — with real-time collaboration built in.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="h-12 px-6 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-glow transition shadow-[var(--shadow-glow)]"
            >
              Start designing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="h-12 px-6 inline-flex items-center rounded-xl border border-border text-sm font-semibold hover:bg-surface transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12 pb-24">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
          <FeatureCard
            icon={Sparkles}
            title="AI-Generated Designs"
            description="Describe your system in plain language and watch it become a live architecture diagram."
          />
          <FeatureCard
            icon={Users}
            title="Real-Time Collaboration"
            description="Design together with your team on a shared canvas, in sync, in real time."
          />
          <FeatureCard
            icon={Layers}
            title="Living Documentation"
            description="Export polished architecture docs and diagrams whenever your design evolves."
          />
        </div>
      </section>

      <footer className="px-6 lg:px-12 py-8 border-t border-border text-center text-xs font-mono text-muted-foreground">
        © 2026 infraAI · Built for engineers.
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6 text-left">
      <div className="h-10 w-10 rounded-lg bg-primary/15 grid place-items-center mb-4">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
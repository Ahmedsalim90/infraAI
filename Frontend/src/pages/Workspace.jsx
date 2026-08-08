import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  X,
  Settings,
  Bell,
  SendHorizonal,
  MessageSquare,
  Users,
  Sparkles,
  ArrowLeft,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Modal, Toast } from "@/components/Modal";
import { cn } from "@/lib/utils";
import Canvas from "@/components/Canvas";
import { useDesignStore } from "@/store/designStore";

const initialMessages = [
  { author: "Priya", role: "user", text: "Should we split the auth service before the migration?" },
  { author: "You", role: "self", text: "Yes — I'll draft an ADR. Let's ask the AI to sketch both options." },
  {
    author: "infraAI",
    role: "ai",
    text: "Generated two variants: (A) monolithic auth with feature flag, (B) federated identity with OIDC. See canvas overlay.",
  },
];

const members = [
  { name: "Priya Shah", role: "Editor", online: true },
  { name: "Marcus Lee", role: "Viewer", online: true },
  { name: "Zara Ali", role: "Owner", online: false },
  { name: "Jonas B.", role: "Editor", online: false },
];

export default function Workspace() {
  const setDesignFromBackend = useDesignStore((s) => s.setDesignFromBackend);

  useEffect(() => {
    // TEMPORARY: hardcoded test data so we can verify the canvas itself
    // works (drag, connect, add/delete) before wiring the real backend.
    setDesignFromBackend({
      nodes: [
        { id: "1", type: "api_gateway", label: "API Gateway" },
        { id: "2", type: "ec2", label: "Checkout Svc" },
        { id: "3", type: "ec2", label: "Payments Svc" },
        { id: "4", type: "database", label: "Postgres · checkout" },
        { id: "5", type: "redis", label: "Kafka · orders.v1" },
      ],
      edges: [
        { from: "1", to: "2", label: "routes to" },
        { from: "1", to: "3", label: "routes to" },
        { from: "2", to: "4", label: "reads/writes" },
        { from: "3", to: "5", label: "publishes to" },
      ],
    });
  }, [setDesignFromBackend]);

  const [tab, setTab] = useState("ai");
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const send = () => {
    const text = draft.trim().slice(0, 2000);
    if (!text) return;
    const isAi = tab === "ai";
    setMessages((m) => [...m, { author: "You", role: "self", text }]);
    setDraft("");
    if (isAi) {
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          { author: "infraAI", role: "ai", text: "Understood. Adding the requested nodes and updating the data-flow arrows on the canvas." },
        ]);
      }, 700);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard?.writeText("https://infraai.dev/s/checkout-mesh-v3");
      setToast("Link copied");
    } catch {
      setToast("Couldn't copy — copy it manually");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <header className="h-14 border-b border-border flex items-center gap-3 px-4 shrink-0">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Logo className="h-8" />
        <div className="h-6 w-px bg-border mx-2" />
        <div className="text-sm">
          <span className="text-muted-foreground">checkout-mesh</span>
          <span className="text-muted-foreground mx-1.5">/</span>
          <span className="font-medium">v3 · payments topology</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex -space-x-2 mr-2">
            {["P", "M", "Z"].map((c, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary to-primary-glow grid place-items-center text-[11px] font-semibold text-primary-foreground"
              >
                {c}
              </div>
            ))}
          </div>
          <button onClick={() => setShareOpen(true)} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition">
            Share
          </button>
          <button onClick={() => setToast("No new notifications")} className="h-9 w-9 grid place-items-center rounded-full text-muted-foreground hover:bg-surface">
            <Bell className="h-4 w-4" />
          </button>
          <Link to="/settings" className="h-9 w-9 grid place-items-center rounded-full text-muted-foreground hover:bg-surface">
            <Settings className="h-4 w-4" />
          </Link>
          <button
            className="text-muted-foreground hover:text-foreground h-9 w-9 grid place-items-center rounded-full hover:bg-surface transition"
            onClick={() => setPanelOpen((v) => !v)}
            title={panelOpen ? "Close panel" : "Open panel"}
          >
            {panelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative overflow-hidden">
          <Canvas />
        </div>

        <aside
          className={cn(
            "w-full sm:w-96 border-l border-border bg-card flex-col shrink-0",
            panelOpen ? "flex" : "hidden",
            "absolute lg:relative right-0 top-14 lg:top-0 bottom-0 z-30",
          )}
        >
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="inline-flex bg-surface rounded-xl p-1 border border-border">
              {(["ai", "comments", "members"]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold capitalize transition",
                    tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t === "ai" && <Sparkles className="h-3.5 w-3.5" />}
                  {t === "comments" && <MessageSquare className="h-3.5 w-3.5" />}
                  {t === "members" && <Users className="h-3.5 w-3.5" />}
                  {t === "ai" ? "AI terminal" : t}
                </button>
              ))}
            </div>
            <button className="text-muted-foreground hover:text-foreground" onClick={() => setPanelOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          {tab === "members" ? (
            <ul className="flex-1 overflow-y-auto p-4 space-y-2">
              {members.map((m) => (
                <li key={m.name} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/60">
                  <div className="relative">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-glow grid place-items-center text-primary-foreground text-sm font-semibold">
                      {m.name[0]}
                    </div>
                    {m.online && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[color:var(--success)] border-2 border-card" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.role}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {tab === "ai" && (
                  <div className="rounded-xl border border-border bg-surface/60 p-3 text-[11px] font-mono text-muted-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
                    infraAI · connected · context: checkout-mesh/v3
                  </div>
                )}
                {messages.filter((m) => (tab === "ai" ? true : m.role !== "ai")).map((m, i) => (
                  <Bubble key={i} {...m} />
                ))}
              </div>
              <div className="border-t border-border p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl bg-surface border pl-3 pr-1.5 py-1.5 transition",
                    tab === "ai" ? "border-primary/40 focus-within:border-primary" : "border-border",
                  )}
                >
                  {tab === "ai" && <span className="text-primary font-mono text-xs">$</span>}
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    maxLength={2000}
                    placeholder={tab === "ai" ? "Ask infraAI to modify the canvas…" : "Reply…"}
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground py-1.5"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="h-8 w-8 grid place-items-center rounded-lg bg-primary text-primary-foreground hover:bg-primary-glow disabled:opacity-40 transition"
                  >
                    <SendHorizonal className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </aside>
      </div>

      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title="Share this architecture" description="Invite engineers or copy a read-only link.">
        <div className="flex gap-2">
          <input readOnly value="https://infraai.dev/s/checkout-mesh-v3" className="flex-1 h-11 rounded-lg bg-surface border border-border px-3.5 text-sm font-mono" />
          <button onClick={copyShareLink} className="h-11 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition">
            Copy
          </button>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">Anyone with this link can view. Editors can be added from the Members tab.</div>
        <div className="flex justify-end mt-6">
          <button onClick={() => setShareOpen(false)} className="h-10 px-4 rounded-lg bg-surface border border-border text-sm font-semibold hover:bg-surface-2 transition">
            Done
          </button>
        </div>
      </Modal>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function Bubble({ author, role, text }) {
  const isSelf = role === "self";
  const isAi = role === "ai";
  return (
    <div className={cn("flex gap-2", isSelf && "flex-row-reverse")}>
      <div
        className={cn(
          "h-7 w-7 rounded-full grid place-items-center text-[11px] font-semibold shrink-0",
          isAi ? "bg-primary/15 text-primary ring-1 ring-primary/40" : "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground",
        )}
      >
        {isAi ? <Sparkles className="h-3.5 w-3.5" /> : author[0]}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm",
          isSelf ? "bg-primary text-primary-foreground rounded-tr-sm" : isAi ? "bg-surface border border-primary/30 rounded-tl-sm font-mono text-[13px]" : "bg-surface border border-border rounded-tl-sm",
        )}
      >
        {!isSelf && <div className="text-[10px] font-mono uppercase tracking-wider mb-1 opacity-70">{author}</div>}
        {text}
      </div>
    </div>
  );
}
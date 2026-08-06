import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Settings,
  Bell,
  Menu,
  SendHorizonal,
  MessageSquare,
  Users,
  Sparkles,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Modal, Toast } from "@/components/Modal";
import { cn } from "@/lib/utils";
import Canvas from "@/components/Canvas";
import useDesignStore from "@/store/designStore";

const initialMessages = [
  { author: "Priya", role: "user", text: "Should we split the auth service before the migration?" },
  { author: "You", role: "self", text: "Yes — I'll draft an ADR. Let's ask the AI to sketch both options." },
];

const members = [
  { name: "Priya Shah", role: "Editor", online: true },
  { name: "Marcus Lee", role: "Viewer", online: true },
];

export default function Workspace() {
  const [tab, setTab] = useState("ai");
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const addNode = useDesignStore((state) => state.addNode);

  const addNewNode = () => {
    const id = `node-${Date.now()}`;
    addNode({
      id,
      type: "serviceNode",
      position: { x: 200 + Math.random() * 200, y: 150 + Math.random() * 200 },
      data: { serviceType: "Default", label: "New Service", config: {} },
    });
  };

  const send = () => {
    const text = draft.trim().slice(0, 2000);
    if (!text) return;
    setMessages((m) => [...m, { author: "You", role: "self", text }]);
    setDraft("");
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard?.writeText("https://infraai.dev/s/demo-project");
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
          <span className="text-muted-foreground">infraAI</span>
          <span className="text-muted-foreground mx-1.5">/</span>
          <span className="font-medium">workspace</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setShareOpen(true)} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition">
            Share
          </button>
          <button onClick={() => setToast("No new notifications")} className="h-9 w-9 grid place-items-center rounded-full text-muted-foreground hover:bg-surface">
            <Bell className="h-4 w-4" />
          </button>
          <Link to="/settings" className="h-9 w-9 grid place-items-center rounded-full text-muted-foreground hover:bg-surface">
            <Settings className="h-4 w-4" />
          </Link>
          <button className="lg:hidden text-muted-foreground" onClick={() => setPanelOpen((v) => !v)}>
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
       <div className="flex-1 relative overflow-hidden flex">
          <div className="w-14 border-r border-border flex flex-col items-center py-4 gap-1 shrink-0 bg-card">
            <button
              onClick={addNewNode}
              title="Add node"
              className="h-10 w-10 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 relative">
            <Canvas />
          </div>
        </div>

        <aside
          className={cn(
            "w-full sm:w-96 border-l border-border bg-card flex-col shrink-0",
            panelOpen ? "flex" : "hidden lg:flex",
            "absolute lg:relative right-0 top-14 lg:top-0 bottom-0 z-30",
          )}
        >
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="inline-flex bg-surface rounded-xl p-1 border border-border">
              {["ai", "comments", "members"].map((t) => (
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
          </div>

          {tab === "members" ? (
            <ul className="flex-1 overflow-y-auto p-4 space-y-2">
              {members.map((m) => (
                <li key={m.name} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/60">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-glow grid place-items-center text-primary-foreground text-sm font-semibold">
                    {m.name[0]}
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
                {messages.filter((m) => (tab === "ai" ? true : m.role !== "ai")).map((m, i) => (
                  <div key={i} className={cn("flex gap-2", m.role === "self" && "flex-row-reverse")}>
                    <div className="h-7 w-7 rounded-full grid place-items-center text-[11px] font-semibold shrink-0 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                      {m.author[0]}
                    </div>
                    <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm", m.role === "self" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-surface border border-border rounded-tl-sm")}>
                      {m.role !== "self" && <div className="text-[10px] font-mono uppercase tracking-wider mb-1 opacity-70">{m.author}</div>}
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                  className="flex items-center gap-2 rounded-xl bg-surface border border-border pl-3 pr-1.5 py-1.5"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    maxLength={2000}
                    placeholder="Ask infraAI to modify the canvas…"
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground py-1.5"
                  />
                  <button type="submit" disabled={!draft.trim()} className="h-8 w-8 grid place-items-center rounded-lg bg-primary text-primary-foreground hover:bg-primary-glow disabled:opacity-40 transition">
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
          <input readOnly value="https://infraai.dev/s/demo-project" className="flex-1 h-11 rounded-lg bg-surface border border-border px-3.5 text-sm font-mono" />
          <button onClick={copyShareLink} className="h-11 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition">
            Copy
          </button>
        </div>
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
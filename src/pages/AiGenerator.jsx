import { AppShell } from "@/components/AppShell";
import { Modal, ConfirmDialog, Toast, Field, inputClass } from "@/components/Modal";
import { Plus, SendHorizonal, Sparkles, MessageSquarePlus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

const initialHistory = [
  "Multi-region checkout with Kafka",
  "Zero-trust auth for internal APIs",
  "Event-sourced order pipeline",
  "Realtime presence over WebSockets",
  "Feature-store for recommendations",
  "OpenTelemetry rollout plan",
];

export default function AiGenerator() {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState(initialHistory);
  const [messages, setMessages] = useState([]);
  const [conversationName, setConversationName] = useState("New conversation");
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState(null);

  const send = (text) => {
    // Cap length defensively; a prompt box is a common XSS/DoS vector if the
    // text is ever rendered as HTML or forwarded unbounded to a backend.
    const t = text.trim().slice(0, 4000);
    if (!t) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setHistory((h) => [t, ...h].slice(0, 20));
    setPrompt("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "ai", text: `Drafted an architecture for "${t}". Added components, boundaries, data-flow arrows and ADRs to the canvas.` },
      ]);
    }, 600);
  };

  const newConversation = () => {
    setMessages([]);
    setConversationName("New conversation");
    setToast("New conversation started");
  };

  return (
    <AppShell searchPlaceholder="Search generations…">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 -mt-4">
        <aside className="rounded-2xl border border-border bg-card p-4 h-fit lg:sticky lg:top-24">
          <button onClick={newConversation} className="w-full inline-flex items-center gap-2 justify-center h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition">
            <MessageSquarePlus className="h-4 w-4" /> New conversation
          </button>
          <button
            onClick={() => {
              setNewName(conversationName);
              setRenameOpen(true);
            }}
            className="mt-2 w-full inline-flex items-center gap-2 justify-center h-10 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface-2 transition"
          >
            <Pencil className="h-4 w-4" /> Rename
          </button>

          <div className="mt-6 flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Prompt history</span>
            {history.length > 0 && (
              <button onClick={() => setConfirmClear(true)} className="text-[11px] text-muted-foreground hover:text-destructive transition">
                Clear
              </button>
            )}
          </div>
          <ul className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
            {history.map((h, i) => (
              <li key={`${h}-${i}`}>
                <div className="group flex items-center gap-1 rounded-lg hover:bg-surface transition">
                  <button onClick={() => setPrompt(h)} className="flex-1 text-left px-3 py-2.5 text-sm text-foreground/80 hover:text-foreground truncate">
                    {h}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(h)}
                    aria-label="Delete"
                    className="mr-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
            {history.length === 0 && <li className="text-xs text-muted-foreground px-3 py-4 text-center">No prompts yet.</li>}
          </ul>
        </aside>

        <section className="relative rounded-2xl border border-border bg-card min-h-[70vh] flex flex-col overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-64 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />

          <div className="relative flex-1 flex flex-col p-8">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/15 text-primary grid place-items-center mb-6 ring-1 ring-primary/30">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                  Hey Alchemist, <span className="text-gradient">what are we architecting today?</span>
                </h2>
                <p className="mt-3 text-muted-foreground max-w-lg">
                  Describe your system. infraAI will draft components, boundaries, data flows and generate the docs alongside it.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-2xl">
                  {[
                    "Design a payment mesh with idempotency",
                    "Draft an event-driven order pipeline",
                    "Plan multi-region failover for Postgres",
                    "Sketch a feature-store for recs",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs px-3 py-2 rounded-full bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-surface border border-primary/30 font-mono text-[13px]"}`}>
                      {m.role === "ai" && <div className="text-[10px] uppercase tracking-wider mb-1 opacity-70">infraAI</div>}
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative border-t border-border p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(prompt);
              }}
              className="flex items-center gap-2 rounded-2xl bg-surface border border-border pl-3 pr-2 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition"
            >
              <button
                type="button"
                onClick={() => setToast("Attachment support coming soon")}
                className="h-9 w-9 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2 transition"
              >
                <Plus className="h-4 w-4" />
              </button>
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={4000}
                placeholder="Describe the system you want to design…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground py-2"
              />
              <span className="hidden md:inline text-[10px] font-mono text-muted-foreground px-2">⌘ ↵</span>
              <button
                type="submit"
                className="h-9 w-9 grid place-items-center rounded-lg bg-primary text-primary-foreground hover:bg-primary-glow transition disabled:opacity-40"
                disabled={!prompt.trim()}
              >
                <SendHorizonal className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </div>

      <Modal open={renameOpen} onClose={() => setRenameOpen(false)} title="Rename conversation">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = newName.trim();
            if (!trimmed) return;
            setConversationName(trimmed.slice(0, 80));
            setRenameOpen(false);
            setToast("Conversation renamed");
          }}
          className="space-y-4"
        >
          <Field label="New name">
            <input required autoFocus maxLength={80} value={newName} onChange={(e) => setNewName(e.target.value)} className={inputClass} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setRenameOpen(false)} className="h-10 px-4 rounded-lg bg-surface border border-border text-sm font-semibold hover:bg-surface-2 transition">
              Cancel
            </button>
            <button type="submit" className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition">
              Save
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          setHistory((h) => h.filter((x) => x !== confirmDelete));
          setToast("Prompt removed");
        }}
        title="Remove this prompt from history?"
        confirmText="Remove"
        destructive
      />
      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          setHistory([]);
          setToast("Prompt history cleared");
        }}
        title="Clear all prompt history?"
        description="This won't affect saved architectures — only your prompt list."
        confirmText="Clear"
        destructive
      />
      <Toast message={toast} onDone={() => setToast(null)} />
    </AppShell>
  );
}

import { AppShell, StatCard, DateChip } from "@/components/AppShell";
import { Modal, ConfirmDialog, Toast, Field, inputClass } from "@/components/Modal";
import { Users, Boxes, Plus, Trash2, MoreHorizontal, Mail, Pencil, LogOut, Copy } from "lucide-react";
import { useState } from "react";
import { isValidEmail, sanitizeText } from "@/lib/validation";

const initial = [
  { name: "Platform core", members: ["A", "P", "M", "Z"], architectures: 5, focus: "Microservices · infra", role: "Owner" },
  { name: "Payments squad", members: ["J", "R", "S"], architectures: 3, focus: "Event-driven · payments", role: "Editor" },
  { name: "Data infra", members: ["K", "N"], architectures: 2, focus: "Lakehouse · streaming", role: "Viewer" },
  { name: "SRE guild", members: ["L", "T", "E", "O", "V"], architectures: 4, focus: "Runbooks · reliability", role: "Editor" },
];

export default function Team() {
  const [teams, setTeams] = useState(initial);
  const [selected, setSelected] = useState(new Set());
  const [showNew, setShowNew] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [confirmRow, setConfirmRow] = useState(null);
  const [confirmLeave, setConfirmLeave] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [toast, setToast] = useState(null);

  const toggle = (n) =>
    setSelected((s) => {
      const c = new Set(s);
      if (c.has(n)) c.delete(n);
      else c.add(n);
      return c;
    });

  return (
    <AppShell
      title="Team & collaboration"
      subtitle="Squads working on your architectures — with roles, shared designs and invites."
      searchPlaceholder="Search squads, members…"
      actions={
        <>
          <DateChip date="Sun · 19 Jul 2026" />
          <button
            onClick={() => setShowInvite(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary/10 text-primary border border-primary/30 text-sm font-semibold hover:bg-primary/20 transition"
          >
            <Mail className="h-4 w-4" /> Invite engineer
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition"
          >
            <Plus className="h-4 w-4" /> New squad
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Users} value={14} label="Engineers collaborating" />
        <StatCard icon={Boxes} value={9} label="Shared architectures" accent="success" />
        <StatCard icon={Mail} value={3} label="Pending invites" accent="warning" />
      </div>

      <div className="mt-8 flex items-center gap-3 flex-wrap">
        <select className="h-10 rounded-lg bg-surface border border-border px-3 text-sm">
          <option>All squads</option>
          <option>Owned by me</option>
          <option>I'm invited</option>
        </select>
        <select className="h-10 rounded-lg bg-surface border border-border px-3 text-sm">
          <option>Most active</option>
          <option>Most members</option>
          <option>A – Z</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{selected.size} selected</span>
          <button
            onClick={() => selected.size && setConfirmBulk(true)}
            disabled={!selected.size}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm font-semibold hover:bg-destructive/25 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[32px_1.5fr_1.5fr_1fr_100px_40px] gap-4 px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground bg-surface border-b border-border">
          <span />
          <span>Squad</span>
          <span>Members</span>
          <span>Architectures</span>
          <span>Your role</span>
          <span />
        </div>
        <ul>
          {teams.map((t) => (
            <li
              key={t.name}
              className="grid grid-cols-[32px_1.5fr_1.5fr_1fr_100px_40px] gap-4 items-center px-6 py-4 border-b border-border/60 last:border-none hover:bg-surface/50 transition"
            >
              <input type="checkbox" checked={selected.has(t.name)} onChange={() => toggle(t.name)} className="h-4 w-4 accent-[color:var(--primary)]" />
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono truncate">{t.focus}</div>
                </div>
              </div>
              <div className="flex -space-x-2">
                {t.members.map((m, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-card bg-gradient-to-br from-primary to-primary-glow grid place-items-center text-[11px] font-semibold text-primary-foreground"
                  >
                    {m}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-mono inline-flex items-center gap-1.5">
                <Boxes className="h-3.5 w-3.5" />
                {t.architectures}
              </span>
              <span className="inline-flex w-fit px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/15 text-primary">{t.role}</span>
              <div className="relative">
                <button onClick={() => setMenuFor(menuFor === t.name ? null : t.name)} className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuFor === t.name && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setMenuFor(null)} />
                    <div className="absolute right-0 top-8 z-30 w-48 rounded-xl border border-border bg-card shadow-2xl p-1.5">
                      <Item icon={Pencil} label="Rename squad" onClick={() => { setMenuFor(null); setToast("Renaming…"); }} />
                      <Item icon={Mail} label="Invite member" onClick={() => { setMenuFor(null); setShowInvite(true); }} />
                      <Item icon={Copy} label="Copy invite link" onClick={() => { setMenuFor(null); setToast("Invite link copied"); }} />
                      <div className="my-1 border-t border-border" />
                      <Item icon={LogOut} label="Leave squad" destructive onClick={() => { setMenuFor(null); setConfirmLeave(t.name); }} />
                      <Item icon={Trash2} label="Delete squad" destructive onClick={() => { setMenuFor(null); setConfirmRow(t.name); }} />
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <NewSquadModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreate={(s) => {
          setTeams((t) => [s, ...t]);
          setToast(`Squad "${s.name}" created`);
        }}
      />

      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} onInvite={(e) => setToast(`Invite sent to ${e}`)} />

      <ConfirmDialog
        open={confirmBulk}
        onClose={() => setConfirmBulk(false)}
        onConfirm={() => {
          setTeams((t) => t.filter((x) => !selected.has(x.name)));
          setToast(`${selected.size} squad${selected.size === 1 ? "" : "s"} deleted`);
          setSelected(new Set());
        }}
        title={`Delete ${selected.size} squad${selected.size === 1 ? "" : "s"}?`}
        description="Members lose shared access to attached architectures."
        confirmText="Delete"
        destructive
      />
      <ConfirmDialog
        open={!!confirmRow}
        onClose={() => setConfirmRow(null)}
        onConfirm={() => {
          setTeams((t) => t.filter((x) => x.name !== confirmRow));
          setToast(`Deleted "${confirmRow}"`);
        }}
        title={`Delete "${confirmRow}"?`}
        confirmText="Delete"
        destructive
      />
      <ConfirmDialog
        open={!!confirmLeave}
        onClose={() => setConfirmLeave(null)}
        onConfirm={() => setToast(`Left "${confirmLeave}"`)}
        title={`Leave "${confirmLeave}"?`}
        description="You'll lose access to its shared architectures unless re-invited."
        confirmText="Leave squad"
        destructive
      />

      <Toast message={toast} onDone={() => setToast(null)} />
    </AppShell>
  );
}

function Item({ icon: Icon, label, onClick, destructive }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${destructive ? "text-destructive hover:bg-destructive/10" : "hover:bg-surface"}`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function NewSquadModal({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Create a new squad" description="Group engineers who own or review a set of architectures together.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const cleanName = sanitizeText(name, 60);
          if (!cleanName) return;
          onCreate({ name: cleanName, focus: sanitizeText(focus, 80) || "General", members: ["A"], architectures: 0, role: "Owner" });
          setName("");
          setFocus("");
          onClose();
        }}
        className="space-y-4"
      >
        <Field label="Squad name">
          <input required autoFocus maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="Platform core" className={inputClass} />
        </Field>
        <Field label="Focus area">
          <input maxLength={80} value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Microservices · infra" className={inputClass} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg bg-surface border border-border text-sm font-semibold hover:bg-surface-2 transition">
            Cancel
          </button>
          <button type="submit" className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition">
            Create squad
          </button>
        </div>
      </form>
    </Modal>
  );
}

function InviteModal({ open, onClose, onInvite }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Editor");
  const [error, setError] = useState(null);
  return (
    <Modal open={open} onClose={onClose} title="Invite an engineer" description="They'll get an email to join your workspace with the chosen role.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          if (!isValidEmail(email)) {
            setError("Enter a valid email address.");
            return;
          }
          onInvite(email.trim());
          setEmail("");
          onClose();
        }}
        className="space-y-4"
        noValidate
      >
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Field label="Work email">
          <input required type="email" maxLength={254} autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="engineer@company.dev" className={inputClass} />
        </Field>
        <Field label="Role">
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
            <option>Viewer</option>
            <option>Editor</option>
            <option>Owner</option>
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg bg-surface border border-border text-sm font-semibold hover:bg-surface-2 transition">
            Cancel
          </button>
          <button type="submit" className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition">
            Send invite
          </button>
        </div>
      </form>
    </Modal>
  );
}

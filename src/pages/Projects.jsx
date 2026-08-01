import { AppShell, StatCard, DateChip } from "@/components/AppShell";
import { Modal, ConfirmDialog, Toast, Field, inputClass } from "@/components/Modal";
import { ImportModal, ExportModal } from "@/components/ImportExportModals";
import {
  Boxes,
  ShieldCheck,
  Sparkles,
  Plus,
  Download,
  Upload,
  Trash2,
  MoreHorizontal,
  Cpu,
  Copy,
  Pencil,
  ExternalLink,
  FileDown,
} from "lucide-react";
import { useState } from "react";
import { sanitizeText } from "@/lib/validation";

const initial = [
  { name: "checkout-mesh", pattern: "Microservices", components: 14, updated: "2h ago", status: "Validated" },
  { name: "realtime-gateway", pattern: "Event-driven", components: 9, updated: "Yesterday", status: "In review" },
  { name: "edge-cdn-config", pattern: "Infrastructure", components: 7, updated: "2d ago", status: "Validated" },
  { name: "auth-federation", pattern: "Security", components: 6, updated: "4d ago", status: "Draft" },
  { name: "data-lakehouse", pattern: "Data platform", components: 18, updated: "1w ago", status: "Validated" },
  { name: "ml-inference-mesh", pattern: "ML / MLOps", components: 11, updated: "1w ago", status: "Draft" },
];

const statusStyles = {
  Validated: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
  "In review": "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
  Draft: "bg-muted text-muted-foreground",
};

export default function Projects() {
  const [rows, setRows] = useState(initial);
  const [selected, setSelected] = useState(new Set());
  const [showNew, setShowNew] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [confirmRow, setConfirmRow] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [toast, setToast] = useState(null);

  const toggle = (n) =>
    setSelected((s) => {
      const c = new Set(s);
      if (c.has(n)) c.delete(n);
      else c.add(n);
      return c;
    });

  const createOne = (data) => {
    setRows((r) => [{ name: data.name, pattern: data.pattern, components: 0, updated: "just now", status: "Draft" }, ...r]);
    setToast(`Architecture "${data.name}" created`);
  };

  return (
    <AppShell
      title="Architectures"
      subtitle="Every system you're designing — pattern, size and lifecycle status."
      searchPlaceholder="Search architectures…"
      actions={
        <>
          <DateChip date="Sun · 19 Jul 2026" />
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition"
          >
            <Plus className="h-4 w-4" /> New architecture
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary/10 text-primary border border-primary/30 text-sm font-semibold hover:bg-primary/20 transition"
          >
            <Upload className="h-4 w-4" /> Import
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-surface border border-border text-sm font-semibold hover:bg-surface-2 transition"
          >
            <Download className="h-4 w-4" /> Export
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Boxes} value={rows.length} label="Active architectures" />
        <StatCard icon={Sparkles} value={7} label="AI-generated designs" accent="warning" />
        <StatCard icon={ShieldCheck} value={rows.filter((r) => r.status === "Validated").length} label="Validated & ready to ship" accent="success" />
      </div>

      <div className="mt-8 flex items-center gap-3 flex-wrap">
        <select className="h-10 rounded-lg bg-surface border border-border px-3 text-sm">
          <option>All patterns</option>
          <option>Microservices</option>
          <option>Event-driven</option>
          <option>Serverless</option>
          <option>Data platform</option>
          <option>Security</option>
        </select>
        <select className="h-10 rounded-lg bg-surface border border-border px-3 text-sm">
          <option>Recently updated</option>
          <option>Most components</option>
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
        <div className="grid grid-cols-[32px_1.5fr_1fr_1fr_120px_40px] gap-4 px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground bg-surface border-b border-border">
          <span />
          <span>Architecture</span>
          <span>Pattern</span>
          <span>Components</span>
          <span>Status</span>
          <span />
        </div>
        <ul>
          {rows.map((r) => (
            <li
              key={r.name}
              className="grid grid-cols-[32px_1.5fr_1fr_1fr_120px_40px] gap-4 items-center px-6 py-4 border-b border-border/60 last:border-none hover:bg-surface/50 transition"
            >
              <input type="checkbox" checked={selected.has(r.name)} onChange={() => toggle(r.name)} className="h-4 w-4 accent-[color:var(--primary)]" />
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                  <Boxes className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono truncate">updated {r.updated}</div>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{r.pattern}</span>
              <span className="text-sm text-muted-foreground font-mono inline-flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                {r.components} nodes
              </span>
              <span className={`inline-flex w-fit px-2.5 py-1 rounded-full text-[11px] font-medium ${statusStyles[r.status]}`}>{r.status}</span>
              <div className="relative">
                <button onClick={() => setMenuFor(menuFor === r.name ? null : r.name)} className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuFor === r.name && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setMenuFor(null)} />
                    <div className="absolute right-0 top-8 z-30 w-48 rounded-xl border border-border bg-card shadow-2xl p-1.5">
                      <MenuItem icon={ExternalLink} label="Open" onClick={() => { setMenuFor(null); setToast(`Opening ${r.name}…`); }} />
                      <MenuItem icon={Pencil} label="Rename" onClick={() => { setMenuFor(null); setToast(`Renaming ${r.name}`); }} />
                      <MenuItem
                        icon={Copy}
                        label="Duplicate"
                        onClick={() => {
                          setMenuFor(null);
                          setRows((rs) => [{ ...r, name: `${r.name}-copy`, updated: "just now" }, ...rs]);
                          setToast("Duplicated");
                        }}
                      />
                      <MenuItem icon={FileDown} label="Export" onClick={() => { setMenuFor(null); setShowExport(true); }} />
                      <div className="my-1 border-t border-border" />
                      <MenuItem icon={Trash2} label="Delete" destructive onClick={() => { setMenuFor(null); setConfirmRow(r.name); }} />
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <NewArchitectureModal open={showNew} onClose={() => setShowNew(false)} onCreate={createOne} />

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        title="Import architecture"
        description="Drop a JSON, YAML or Terraform file to import into a new design."
        onImport={() => {
          setShowImport(false);
          setToast("Import complete");
        }}
      />

      <ExportModal
        open={showExport}
        onClose={() => setShowExport(false)}
        onExport={(fmt) => {
          setShowExport(false);
          setToast(`Exported as ${fmt}`);
        }}
      />

      <ConfirmDialog
        open={confirmBulk}
        onClose={() => setConfirmBulk(false)}
        onConfirm={() => {
          setRows((rs) => rs.filter((r) => !selected.has(r.name)));
          setToast(`${selected.size} architecture${selected.size === 1 ? "" : "s"} deleted`);
          setSelected(new Set());
        }}
        title={`Delete ${selected.size} architecture${selected.size === 1 ? "" : "s"}?`}
        description="Their canvases, ADRs and diagrams will be permanently removed."
        confirmText="Delete"
        destructive
      />

      <ConfirmDialog
        open={!!confirmRow}
        onClose={() => setConfirmRow(null)}
        onConfirm={() => {
          setRows((rs) => rs.filter((r) => r.name !== confirmRow));
          setToast(`"${confirmRow}" deleted`);
        }}
        title={`Delete "${confirmRow}"?`}
        description="This will remove the canvas, ADRs and diagrams."
        confirmText="Delete"
        destructive
      />

      <Toast message={toast} onDone={() => setToast(null)} />
    </AppShell>
  );
}

function MenuItem({ icon: Icon, label, onClick, destructive }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
        destructive ? "text-destructive hover:bg-destructive/10" : "hover:bg-surface"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function NewArchitectureModal({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [pattern, setPattern] = useState("Microservices");
  const [desc, setDesc] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="New architecture" description="Start a fresh canvas. You can invite the AI to draft it in seconds.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const cleanName = sanitizeText(name, 80);
          if (!cleanName) return;
          onCreate({ name: cleanName, pattern });
          setName("");
          setDesc("");
          onClose();
        }}
        className="space-y-4"
      >
        <Field label="Name">
          <input required autoFocus maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="checkout-mesh" className={inputClass} />
        </Field>
        <Field label="Architectural pattern">
          <select value={pattern} onChange={(e) => setPattern(e.target.value)} className={inputClass}>
            <option>Microservices</option>
            <option>Event-driven</option>
            <option>Serverless</option>
            <option>Monolith / modular</option>
            <option>Data platform</option>
            <option>Security</option>
            <option>ML / MLOps</option>
          </select>
        </Field>
        <Field label="Short description (optional)">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Multi-region checkout with idempotent payments…"
            className={`${inputClass} h-auto py-2.5`}
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg bg-surface border border-border text-sm font-semibold hover:bg-surface-2 transition">
            Cancel
          </button>
          <button type="submit" className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition">
            Create architecture
          </button>
        </div>
      </form>
    </Modal>
  );
}

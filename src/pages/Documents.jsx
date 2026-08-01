import { AppShell, StatCard, DateChip } from "@/components/AppShell";
import { Modal, ConfirmDialog, Toast } from "@/components/Modal";
import { ImportModal, ExportModal } from "@/components/ImportExportModals";
import { FileText, Bot, Download, Upload, Trash2, MoreHorizontal, ShieldCheck, GitBranch, Eye, Pencil, Copy, FileDown } from "lucide-react";
import { useState } from "react";

const initial = [
  { name: "ADR-004 · Event-sourcing store", kind: "ADR", project: "checkout-mesh", time: "12m ago", source: "AI" },
  { name: "checkout-mesh · C4 container diagram", kind: "Diagram", project: "checkout-mesh", time: "1h ago", source: "AI" },
  { name: "Failover runbook — edge-cdn", kind: "Runbook", project: "edge-cdn", time: "3h ago", source: "Imported" },
  { name: "Auth federation · threat model", kind: "Threat model", project: "auth-federation", time: "Yesterday", source: "AI" },
  { name: "Data contracts v2 (orders.v1)", kind: "Spec", project: "realtime-gw", time: "2d ago", source: "Imported" },
];

export default function Documents() {
  const [docs, setDocs] = useState(initial);
  const [selected, setSelected] = useState(new Set());
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [viewing, setViewing] = useState(null);
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

  return (
    <AppShell
      title="Documentation"
      subtitle="ADRs, C4 diagrams, runbooks & threat models — kept in sync with every design."
      searchPlaceholder="Search ADRs, diagrams, runbooks…"
      actions={
        <>
          <DateChip date="Sun · 19 Jul 2026" />
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={FileText} value={docs.length} label="Total artifacts" />
        <StatCard icon={Bot} value={docs.filter((d) => d.source === "AI").length} label="AI-generated" accent="warning" />
        <StatCard icon={GitBranch} value={9} label="C4 diagrams" accent="success" />
        <StatCard icon={ShieldCheck} value={4} label="Threat models" accent="muted" />
      </div>

      <div className="mt-8 flex items-center gap-3 flex-wrap">
        <select className="h-10 rounded-lg bg-surface border border-border px-3 text-sm">
          <option>All artifact types</option>
          <option>ADR</option>
          <option>Diagram (C4)</option>
          <option>Runbook</option>
          <option>Spec</option>
          <option>Threat model</option>
        </select>
        <select className="h-10 rounded-lg bg-surface border border-border px-3 text-sm">
          <option>Newest first</option>
          <option>By architecture</option>
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
        <div className="grid grid-cols-[32px_1.8fr_1fr_1fr_100px_40px] gap-4 px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground bg-surface border-b border-border">
          <span />
          <span>Artifact</span>
          <span>Kind</span>
          <span>Updated</span>
          <span>Source</span>
          <span />
        </div>
        <ul>
          {docs.map((d) => (
            <li
              key={d.name}
              className="grid grid-cols-[32px_1.8fr_1fr_1fr_100px_40px] gap-4 items-center px-6 py-4 border-b border-border/60 last:border-none hover:bg-surface/50 transition"
            >
              <input type="checkbox" checked={selected.has(d.name)} onChange={() => toggle(d.name)} className="h-4 w-4 accent-[color:var(--primary)]" />
              <button onClick={() => setViewing(d)} className="flex items-center gap-3 min-w-0 text-left">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{d.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono truncate">{d.project}</div>
                </div>
              </button>
              <span className="text-sm text-muted-foreground">{d.kind}</span>
              <span className="text-sm text-muted-foreground font-mono">{d.time}</span>
              <span className={`inline-flex w-fit px-2.5 py-1 rounded-full text-[11px] font-medium ${d.source === "AI" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                {d.source}
              </span>
              <div className="relative">
                <button onClick={() => setMenuFor(menuFor === d.name ? null : d.name)} className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuFor === d.name && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setMenuFor(null)} />
                    <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-border bg-card shadow-2xl p-1.5">
                      <Item icon={Eye} label="View" onClick={() => { setMenuFor(null); setViewing(d); }} />
                      <Item icon={Pencil} label="Rename" onClick={() => { setMenuFor(null); setToast("Renaming…"); }} />
                      <Item
                        icon={Copy}
                        label="Duplicate"
                        onClick={() => {
                          setMenuFor(null);
                          setDocs((x) => [{ ...d, name: `${d.name} (copy)`, time: "just now" }, ...x]);
                          setToast("Duplicated");
                        }}
                      />
                      <Item icon={FileDown} label="Download" onClick={() => { setMenuFor(null); setShowExport(true); }} />
                      <div className="my-1 border-t border-border" />
                      <Item icon={Trash2} label="Delete" destructive onClick={() => { setMenuFor(null); setConfirmRow(d.name); }} />
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name ?? ""} description={viewing ? `${viewing.kind} · ${viewing.project}` : ""} size="lg">
        <div className="rounded-xl bg-surface border border-border p-5 font-mono text-xs text-muted-foreground leading-relaxed max-h-96 overflow-y-auto">
          <div className="text-foreground font-semibold mb-2">Context</div>
          <p>
            Auto-generated from the canvas on {viewing?.time}. This artifact reflects the current state of{" "}
            <span className="text-primary">{viewing?.project}</span>.
          </p>
          <div className="text-foreground font-semibold mt-4 mb-2">Decision</div>
          <p>Adopt the pattern illustrated in the linked diagram; enforce contracts on the messaging boundary and require idempotency keys on all mutating endpoints.</p>
          <div className="text-foreground font-semibold mt-4 mb-2">Consequences</div>
          <p>Additional operational overhead for the messaging bus, offset by improved decoupling and clearer failure domains.</p>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setViewing(null)} className="h-10 px-4 rounded-lg bg-surface border border-border text-sm font-semibold hover:bg-surface-2 transition">
            Close
          </button>
          <button
            onClick={() => {
              setViewing(null);
              setShowExport(true);
            }}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition"
          >
            Download
          </button>
        </div>
      </Modal>

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        title="Import documentation"
        description="Drop a Markdown, PDF or Mermaid file."
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
          setDocs((d) => d.filter((x) => !selected.has(x.name)));
          setToast(`${selected.size} deleted`);
          setSelected(new Set());
        }}
        title={`Delete ${selected.size} document${selected.size === 1 ? "" : "s"}?`}
        description="Artifacts will be permanently removed from your workspace."
        confirmText="Delete"
        destructive
      />
      <ConfirmDialog
        open={!!confirmRow}
        onClose={() => setConfirmRow(null)}
        onConfirm={() => {
          setDocs((d) => d.filter((x) => x.name !== confirmRow));
          setToast(`"${confirmRow}" deleted`);
        }}
        title={`Delete "${confirmRow}"?`}
        confirmText="Delete"
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

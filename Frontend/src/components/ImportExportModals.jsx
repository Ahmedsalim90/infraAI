import { useState } from "react";
import { Modal } from "@/components/Modal";
import { Upload } from "lucide-react";

const ALLOWED_EXTENSIONS = [".json"];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export function ImportModal({ open, onClose, onImport, title, description }) {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);

  const onFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setFileError(null);
    if (!f) {
      setFile(null);
      return;
    }
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError(`Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
      setFile(null);
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setFileError("File is larger than the 10 MB limit.");
      setFile(null);
      return;
    }
    setFile(f);
  };

  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <label className="block cursor-pointer">
        <input type="file" className="hidden" accept={ALLOWED_EXTENSIONS.join(",")} onChange={onFileChange} />
        <div className="rounded-xl border-2 border-dashed border-border bg-surface/50 p-8 text-center hover:border-primary/50 transition">
          <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
          <div className="mt-3 text-sm font-medium">{file ? file.name : "Click to browse or drop a file"}</div>
          <div className="text-xs text-muted-foreground mt-1">JSON — up to 10 MB</div>
        </div>
      </label>
      {fileError && <p className="mt-3 text-xs text-destructive">{fileError}</p>}
      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} className="h-10 px-4 rounded-lg bg-surface border border-border text-sm font-semibold hover:bg-surface-2 transition">
          Cancel
        </button>
        <button
          onClick={() => {
            onImport(file);
            setFile(null);
          }}
          disabled={!file}
          className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition disabled:opacity-40"
        >
          Import
        </button>
      </div>
    </Modal>
  );
}

export function ExportModal({ open, onClose, onExport }) {
  const [fmt, setFmt] = useState("JSON (raw design)");
  const options = ["JSON (raw design)", "Documentation (Markdown)"];
  return (
    <Modal open={open} onClose={onClose} title="Export" description="Choose what to download.">
      <div className="space-y-2">
        {options.map((o) => (
          <label
            key={o}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
              fmt === o ? "border-primary/50 bg-primary/5" : "border-border hover:bg-surface"
            }`}
          >
            <input type="radio" name="fmt" checked={fmt === o} onChange={() => setFmt(o)} className="accent-[color:var(--primary)]" />
            <span className="text-sm font-medium">{o}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} className="h-10 px-4 rounded-lg bg-surface border border-border text-sm font-semibold hover:bg-surface-2 transition">
          Cancel
        </button>
        <button onClick={() => onExport(fmt)} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition">
          Export
        </button>
      </div>
    </Modal>
  );
}
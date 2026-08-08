import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ConfirmDialog, Toast } from "@/components/Modal";
import { useState } from "react";
import { Pencil, LogOut, Camera, X, Save, Bell, Shield, KeyRound, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isValidEmail, sanitizeText } from "@/lib/validation";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [notify, setNotify] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [tokensOpen, setTokensOpen] = useState(false);
  const [toast, setToast] = useState(null);

  return (
    <AppShell
      title="My settings"
      subtitle="Update your credentials, avatar and the essentials."
      searchPlaceholder="Search settings…"
      actions={
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition"
        >
          <Pencil className="h-4 w-4" /> Edit account
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary-glow grid place-items-center text-4xl font-bold text-primary-foreground">
                A
              </div>
              <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center border-2 border-card hover:bg-primary-glow transition">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Signed in as</div>
              <h2 className="text-2xl font-bold mt-1">The Alchemist</h2>
              <p className="text-sm text-muted-foreground">alchemist@gmail.com</p>
              <span className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Pro plan · 3 seats
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Display name" value="The Alchemist" />
            <Field label="Work email" value="alchemist@gmail.com" />
            <Field label="Workspace role" value="Owner" />
            <Field label="Default region" value="eu-west-1" />
          </div>

          <div className="mt-8 pt-6 border-t border-border flex justify-end">
            <button
              onClick={() => setLogoutOpen(true)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-destructive/15 border border-destructive/40 text-destructive text-sm font-semibold hover:bg-destructive/25 transition"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <ToggleRow icon={Bell} title="Notifications" desc="Comments, invites and AI completions." value={notify} onChange={setNotify} />
          <ToggleRow icon={Shield} title="Two-factor auth" desc="Require an authenticator on every sign-in." value={twoFA} onChange={setTwoFA} />
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">AI usage this month</div>
                <div className="text-xs text-muted-foreground">142 / 500 generations</div>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: "28%" }} />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <KeyRound className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">API tokens</div>
                <div className="text-xs text-muted-foreground">Programmatic access for CI pipelines.</div>
              </div>
            </div>
            <button
              onClick={() => {
                setTokensOpen(true);
                setToast("Token dashboard opened");
              }}
              className="mt-4 w-full h-9 rounded-lg bg-surface border border-border text-sm font-semibold hover:bg-surface-2 transition"
            >
              Manage tokens
            </button>
          </div>
        </div>
      </div>

      {editing && <EditModal onClose={() => setEditing(false)} onSave={() => setToast("Account updated")} />}

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          logout();
          setToast("Signed out");
          setTimeout(() => navigate("/login", { replace: true }), 400);
        }}
        title="Log out of infraAI?"
        description="You'll need to sign in again to reach your architectures."
        confirmText="Log out"
        destructive
      />
      <ConfirmDialog
        open={tokensOpen}
        onClose={() => setTokensOpen(false)}
        onConfirm={() => setToast("New API token generated")}
        title="Generate a new API token?"
        description="Existing tokens keep working. Store the new one securely — it's shown only once."
        confirmText="Generate token"
      />
      <Toast message={toast} onDone={() => setToast(null)} />
    </AppShell>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-xl bg-surface border border-border p-4">
      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function ToggleRow({ icon: Icon, title, desc, value, onChange }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        className={`relative h-6 w-11 rounded-full transition ${value ? "bg-primary" : "bg-surface-2 border border-border"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function EditModal({ onClose, onSave }) {
  const [name, setName] = useState("The Alchemist");
  const [email, setEmail] = useState("alchemist@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const onSubmit = (e) => {
    e.preventDefault();
    const cleanName = sanitizeText(name, 80);
    if (!cleanName) {
      setError("Name can't be empty.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password && password.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/70 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold">Modify your account</h3>
            <p className="text-sm text-muted-foreground mt-1">All changes here are saved to your workspace.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <LabeledInput label="Name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
          <LabeledInput label="Email" type="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} />
          <LabeledInput
            label="New password"
            type="password"
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            placeholder="Leave blank to keep current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="mt-2 w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-glow transition"
          >
            <Save className="h-4 w-4" /> Save changes
          </button>
        </form>
      </div>
    </div>
  );
}

function LabeledInput({ label, ...rest }) {
  return (
    <label className="block">
      <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        {...rest}
        className="mt-1.5 w-full h-11 rounded-lg bg-surface border border-border px-3.5 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition"
      />
    </label>
  );
}

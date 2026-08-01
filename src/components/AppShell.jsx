import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Frame,
  Sparkles,
  FolderKanban,
  FileText,
  Users,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  LogOut,
  User,
  HelpCircle,
  Sun,
  Moon,
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { ConfirmDialog, Toast } from "./Modal";
import { useTheme } from "@/hooks/use-theme";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workspace", label: "Workspace", icon: Frame },
  { to: "/ai-generator", label: "AI Generator", icon: Sparkles },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/team", label: "My Team", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

const NOTIFICATIONS = [
  { icon: Sparkles, title: "AI finished a topology", desc: "checkout-mesh · 12 services drafted", time: "12m" },
  { icon: Users, title: "Priya joined Platform core", desc: "as an Editor", time: "1h" },
  { icon: FileText, title: "ADR-004 ready to review", desc: "Event-sourcing store", time: "3h" },
];

export function AppShell({ children, title, subtitle, searchPlaceholder = "Search…", actions }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const notifRef = useRef(null);
  const menuRef = useRef(null);
  useEffect(() => {
    const onDoc = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside
        className={cn(
          "fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
            <Logo className="h-9" />
            <button className="lg:hidden text-muted-foreground" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-foreground",
                  )}
                >
                  {active && <span className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-l bg-primary" />}
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border p-3">
            <button
              onClick={() => navigate("/settings")}
              className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent transition text-left"
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-glow grid place-items-center text-primary-foreground font-semibold text-sm">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">The Alchemist</div>
                <div className="text-xs text-muted-foreground truncate">Pro plan</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 lg:px-8 h-16">
            <button className="lg:hidden text-muted-foreground" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  maxLength={200}
                  className="w-full h-10 pl-10 pr-4 rounded-full bg-surface border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition"
                />
              </div>
            </div>

            <button
              onClick={() => {
                toggleTheme();
                setToast(theme === "dark" ? "Light theme on" : "Dark theme on");
              }}
              className="h-10 w-10 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-surface transition"
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link
              to="/settings"
              className="h-10 w-10 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-surface transition"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setMenuOpen(false);
                }}
                className="h-10 w-10 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-surface transition relative"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 rounded-xl border border-border bg-card shadow-2xl z-30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-semibold">Notifications</span>
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        setToast("Marked all as read");
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <ul className="max-h-80 overflow-y-auto">
                    {NOTIFICATIONS.map((n, i) => (
                      <li key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-surface transition border-b border-border/60 last:border-none">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                          <n.icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{n.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{n.desc}</div>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">{n.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => {
                  setMenuOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="h-9 w-9 rounded-full bg-surface-2 border border-border grid place-items-center text-sm font-semibold hover:border-primary/50 transition"
                aria-label="Profile"
              >
                A
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 w-56 rounded-xl border border-border bg-card shadow-2xl z-30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <div className="text-sm font-semibold">The Alchemist</div>
                    <div className="text-xs text-muted-foreground truncate">alchemist@gmail.com</div>
                  </div>
                  <div className="p-1.5">
                    <MenuBtn
                      icon={User}
                      label="Profile & settings"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/settings");
                      }}
                    />
                    <MenuBtn
                      icon={HelpCircle}
                      label="Help & shortcuts"
                      onClick={() => {
                        setMenuOpen(false);
                        setToast("Shortcuts: ⌘K to search");
                      }}
                    />
                    <div className="my-1 border-t border-border" />
                    <MenuBtn
                      icon={LogOut}
                      label="Log out"
                      destructive
                      onClick={() => {
                        setMenuOpen(false);
                        setLogoutOpen(true);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {(title || actions) && (
          <div className="px-4 lg:px-8 pt-8 pb-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              {title && <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>}
              {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
          </div>
        )}

        <main className="flex-1 px-4 lg:px-8 pb-12">{children}</main>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          setToast("Signed out");
          // In production this should also invalidate the session/token
          // server-side and clear any auth cookies, not just navigate.
          setTimeout(() => navigate("/login"), 400);
        }}
        title="Log out of infraAI?"
        description="You'll need to sign in again to reach your architectures."
        confirmText="Log out"
        destructive
      />
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function MenuBtn({ icon: Icon, label, onClick, destructive }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition",
        destructive ? "text-destructive hover:bg-destructive/10" : "hover:bg-surface",
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

export function StatCard({ icon: Icon, value, label, accent = "primary" }) {
  const tones = {
    primary: "text-primary bg-primary/10",
    success: "text-[color:var(--success)] bg-[color:var(--success)]/10",
    warning: "text-[color:var(--warning)] bg-[color:var(--warning)]/10",
    muted: "text-muted-foreground bg-surface-2",
  }[accent];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none"
        style={{ background: "var(--gradient-glow)" }}
      />
      <div className={cn("relative h-11 w-11 rounded-xl grid place-items-center", tones)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="relative mt-5 text-3xl font-bold font-display">{value}</div>
      <div className="relative mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export function DateChip({ date }) {
  return <div className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-mono text-muted-foreground">{date}</div>;
}

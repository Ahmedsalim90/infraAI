import { createContext, useContext, useMemo, useState } from "react";

/**
 * This app has no real backend, so this context only models what a production
 * auth flow should expose to the UI: a session, a login/logout action, and basic
 * brute-force throttling. Two things this intentionally does NOT do, on purpose:
 *  - it never stores credentials or tokens in localStorage/sessionStorage
 *    (those are readable by any script on the page if it's ever XSS'd), and
 *  - it never trusts client-side checks as the real security boundary — a real
 *    backend must re-validate everything here.
 */

const AuthContext = createContext(null);

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);

  const login = (email, password) => {
    if (lockedUntil && Date.now() < lockedUntil) {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000);
      return { ok: false, error: `Too many attempts. Try again in ${secs}s.` };
    }
    // Client-side stand-in for "the request round-tripped to the server and was verified".
    // Never actually compare passwords in the client in a real app.
    const ok = email.trim().length > 0 && password.length >= 8;
    if (!ok) {
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
        setFailedAttempts(0);
        return { ok: false, error: "Too many failed attempts. Locked for 30s." };
      }
      return { ok: false, error: "Invalid email or password." };
    }
    setFailedAttempts(0);
    setSession({ name: "The Alchemist", email: email.trim() });
    return { ok: true };
  };

  const register = (name, email, password) => {
    if (!name.trim() || !email.trim() || password.length < 8) {
      return { ok: false, error: "Please fill every required field with a valid value." };
    }
    setSession({ name: name.trim(), email: email.trim() });
    return { ok: true };
  };

  const logout = () => setSession(null);

  const value = useMemo(
    () => ({ session, isAuthenticated: !!session, failedAttempts, lockedUntil, login, register, logout }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- login/register/logout are recreated each render by design (they close over current state) but are stable in effect.
    [session, failedAttempts, lockedUntil],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

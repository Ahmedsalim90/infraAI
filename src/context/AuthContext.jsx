import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const API_BASE = "http://localhost:5000/api/auth";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.error || "Invalid email or password." };
      }

      setToken(data.access_token);
      setSession(data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: "Could not reach the server. Is the backend running?" };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.error || "Registration failed." };
      }

      return { ok: true };
    } catch (err) {
      return { ok: false, error: "Could not reach the server. Is the backend running?" };
    }
  };

  const logout = () => {
    setSession(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({ session, token, isAuthenticated: !!session, login, register, logout }),
    [session, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
# infraAI — React + Tailwind rebuild

A faithful rebuild of the **Architect AI** Lovable project (`arch-collaborate-ai`) using
plain **React + TypeScript + Tailwind CSS + Vite**, with the same look, layout, pages,
and interactions — plus a set of security hardening changes described below.

## Pages

| Route              | Page                                                          |
| ------------------- | -------------------------------------------------------------- |
| `/login`             | Sign in                                                        |
| `/register`          | Create account                                                 |
| `/forgot-password`   | Password reset request                                        |
| `/` *(protected)*    | Dashboard — activity chart, pattern breakdown, recent comments |
| `/workspace` *(protected)* | Canvas / AI terminal / comments / members panel          |
| `/ai-generator` *(protected)* | AI chat-style architecture generator                 |
| `/projects` *(protected)*     | Architectures list (create / import / export / delete)|
| `/documents` *(protected)*    | ADRs, diagrams, runbooks, threat models                |
| `/team` *(protected)*         | Squads, invites, roles                                 |
| `/settings` *(protected)*     | Profile, notifications, 2FA toggle, API tokens         |

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build locally
npm run lint      # ESLint
```

## What changed from the original, and why

The brief was "rebuild exactly, don't change anything" *plus* "ensure security and no
vulnerability." Those two goals conflict in a couple of small, specific places — the
original had no real security boundary at all (any URL was reachable without signing
in, and there was no input validation). Rather than silently leaving gaps, here's
exactly what was added, kept minimal and clearly commented in the source:

- **Route protection** (`src/components/ProtectedRoute.tsx`, `src/context/AuthContext.tsx`).
  Every page except the three auth pages now requires a session. This is a genuine
  behavior change: reloading the page clears the in-memory session and returns you to
  `/login`. That's intentional — the alternative (persisting a "logged in" flag in
  `localStorage`) is worse, because any injected script could read or forge it.
- **No secrets or session tokens in `localStorage`/`sessionStorage`.** Only the
  dark/light theme preference is persisted there, which is not sensitive.
- **Input validation & sanitization** (`src/lib/validation.ts`): email format checks,
  a password length floor, text trimming/length caps on every free-text field (squad
  names, architecture names, prompts, chat messages), and a small allow-list check
  before ever treating a string as a redirect target (`isSafeInternalPath`), which
  prevents open-redirect style bugs if the "redirect back after login" feature is
  ever extended.
- **Basic client-side brute-force throttling** on login (5 failed attempts → 30s
  lockout). This is UX-layer only — a real backend must do the actual rate limiting.
- **File upload guardrails** in the Import modal: extension allow-list and a 10 MB
  size cap enforced client-side before a file is treated as valid (still requires
  server-side re-validation in a real backend).
- **Content-Security-Policy, Referrer-Policy, and Permissions-Policy** set in
  `index.html` / `vite.config.ts`. Browsers ignore `X-Frame-Options` and
  `Strict-Transport-Security` when set via `<meta>`, so if you deploy this, set those
  two (plus HSTS) at your CDN/reverse-proxy level.
- **No `dangerouslySetInnerHTML` anywhere.** All user-entered text (chat messages,
  prompts, comments) is rendered as plain React text, which is escaped automatically.
- **An error boundary** (`src/components/ErrorBoundary.tsx`) wraps the whole app so an
  unexpected component error shows a safe fallback screen instead of leaking a raw
  stack trace.
- **Visible focus rings and `prefers-reduced-motion` support** added globally in
  `src/styles.css`.

Nothing about the *visual design*, copy, layout, or interaction patterns was changed —
every page, modal, and micro-interaction from the original is reproduced as-is.

## One asset that couldn't be carried over

The original logo was a PNG hosted on Lovable's private project CDN
(`/__l5e/assets-v1/...`), which isn't publicly reachable outside that project. It's
been recreated as an equivalent inline SVG mark (`src/components/Logo.tsx`) — same
cyan diamond-node icon and "infraAI" wordmark, same colors — so no external asset
dependency was introduced.

## Stack

- React 18 + **JavaScript (JSX)** — no TypeScript, no build-time type checking
- Vite 5
- Tailwind CSS 3 (same OKLCH design-token system as the original, dark + light themes)
- React Router 6 (in place of TanStack Router, which required the Lovable-specific
  toolchain)
- Recharts (dashboard chart), lucide-react (icons)

> A TypeScript variant of this same project is also available if you'd prefer static
> type-checking — this build intentionally uses plain `.jsx`/`.js` throughout instead.

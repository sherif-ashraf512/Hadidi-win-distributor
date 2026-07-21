# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

**Hadidi Win — Distributor Portal.** A separate, minimal Next.js app for
distributors to log in and view their own warehouse's stock and stock
movements. It is intentionally its own project (not a route inside
`Hadidi-win-front`) so it can be deployed on its own subdomain, giving
distributors a link that's distinct from the staff dashboard's login.

Sibling repos:
- `../Hadidi-win-back` — the shared Laravel API both this app and the staff
  dashboard talk to. This app only ever calls `/api/distributor/*` routes
  (`DistributorAuthController`, `DistributorStockController`), which are
  scoped server-side to the logged-in distributor's own warehouse — there is
  no `warehouse_id` param anywhere in this app's API calls, by design.
- `../Hadidi-win-front` — the full staff ERP. This app's theme (colors,
  font, Tailwind v4 setup in `app/globals.css`), auth flow shape
  (`lib/auth.js`, `lib/api.js`, `components/auth/require-auth.js`), and
  locale system (`components/providers/locale-provider.js`) were copied from
  there to look and behave the same way. When the staff app's design system
  changes, mirror the change here too if it should apply to distributors.

## What's deliberately NOT copied from Hadidi-win-front

- The multi-item `Sidebar`/`DashboardShell`/`lib/desktop-nav-access.js` —
  this portal has exactly one role and two pages (stock, movements), so a
  simple top bar (`components/layout/portal-shell.js`) replaces the whole
  staff nav system.
- Role/permission gating (`RequireDesktopRoute`) — not needed with a single
  role; `RequireAuth` alone (session-valid check) is enough.
- The full `messages/en.js`/`ar.js` (huge, spans the whole ERP) — this repo
  has its own small trimmed `messages/` with only the keys this portal uses.
- FlashProvider, Radix dropdowns/selects, Reverb/Echo realtime, PDF export —
  none of that exists in this portal's surface area.

## Commands

```bash
npm install
npm run dev     # http://localhost:3000 by default — set a different port if
                 # running alongside Hadidi-win-front locally
npm run build
npm run lint
```

Needs `Hadidi-win-back`'s `php artisan serve` running (see
`NEXT_PUBLIC_API_URL` in `.env.local`, defaults to `http://localhost:8000/api`).

## Conventions

- Keep using the `hadidi-*` color tokens from `app/globals.css` — don't
  introduce new colors without updating the same tokens in
  `Hadidi-win-front/app/globals.css` too, so the two apps stay visually
  consistent.
- All numbers (quantities, counts) render with `Intl.NumberFormat("en-US", …)`
  — Western digits always, never locale-dependent Arabic-Indic digits (see
  `lib/format.js`). Same rule as `Hadidi-win-front`.
- New backend endpoints for this portal go under `/api/distributor/*` in
  `Hadidi-win-back/routes/api.php`, gated by `role:distributor` middleware,
  and must scope to `$request->user()->distributorWarehouse` — never accept
  a warehouse id from the client.

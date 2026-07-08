# EventFlow AI

Event planning and vendor registration shell for Lipscomb University events, markets, and fairs. Built with Next.js (App Router) + TypeScript + Tailwind CSS.

## What's here

- **Vendor registration** (`/vendor`) — survey-style forms, event browsing, and a venue floor-plan booth picker.
- **Event Planner operations** (`/planner`) — a combined analytics + task dashboard, event lifecycle management, a floor-plan builder (templates, drag-to-place, image upload to trace), a vendor directory, a notifications log, and a Users & Access portal.
- **Auth** — email + password on first sign-in, then a fast PIN unlock on the same device afterward (see `lib/auth.ts`).
- **Role-based access** — `admin` / `planner` / `staff` / `vendor`, enforced both by `proxy.ts` (session presence) and by each layout (`app/planner/layout.tsx`, `app/vendor/layout.tsx`) re-checking the real role server-side. Admins/planners can toggle into a live "preview" of the vendor experience.
- **Business rules** — capacity enforcement, automatic waitlist promotion, one-registration-per-attendee-per-event, and per-booth exclusivity, all implemented in `lib/data/registrations.ts` and `lib/data/floorplans.ts`.

## Data layer (temporary, swappable)

Everything currently lives in an in-memory seeded store (`lib/data/store.ts`, `lib/data/seed.ts`) behind small functions in `lib/data/*.ts`. When the real database is ready (Vercel Postgres or similar), swap the bodies of those functions for real queries — the UI and business-rule logic don't need to change.

`lib/notifications.ts` and `lib/ai.ts` are similar seams: they currently log to an in-app feed / return templated text so the app is fully demoable without API keys. Swap them for a real email provider (SendGrid/Resend/Gmail API) and the Claude API respectively when ready.

## Demo accounts

Password for all staff accounts: `password123`

| Email | Role |
|---|---|
| admin@lipscomb.edu | Admin |
| planner@lipscomb.edu | Event Planner |
| staff@lipscomb.edu | Staff |
| vendor@lipscomb.edu | Vendor (Lee's BBQ Co.) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Next steps

- Connect this repo to GitHub and Vercel.
- Add a real database (Vercel Postgres/Neon/etc.) and port `lib/data/*.ts` to it.
- Wire up a real email provider in `lib/notifications.ts` and the Claude API in `lib/ai.ts`.

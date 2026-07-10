# EventFlow AI

An AI-assisted event planning and registration system for organizations that run workshops, classes, community events, training sessions, appointments, fundraisers, and volunteer events.

## Problem

Organizations still manage events through spreadsheets and email, causing overbooking, missed reminders, poor waitlist tracking, and no-shows.

## Solution

EventFlow AI helps organizers manage the full event lifecycle from creation to completion. It controls capacity, manages waitlists, sends automated notifications, and uses AI to assist with event messaging and planning decisions.

For this Lipscomb University build, the app is two-sided: a **vendor/attendee registration experience** (survey-style forms, venue floor-plan booth picking) and an **Event Planner operations dashboard** (analytics, tasks, event lifecycle management, floor-plan builder, user access management).

**Target audience:** small organizations, nonprofits, schools, clubs, and businesses that need structure without a full enterprise event platform.

## Core Entities

| Record Type | Purpose |
|---|---|
| Events | Stores event details such as name, date, location, capacity, status |
| Attendees | Stores participant information such as name, email, phone |
| Registrations | Connects attendees to events and tracks registration status |
| Notifications *(optional)* | Tracks confirmations, reminders, cancellations, and waitlist notices |

## Event Status

| Status | Meaning |
|---|---|
| Draft | Event created but not open for registration |
| Open | People can register |
| Full | Capacity reached |
| Waitlisted | Capacity full, but waitlist is active |
| Closed | Registration is no longer allowed |
| Completed | Event has already occurred |
| Canceled | Event will not happen |

## Registration Status

| Status | Meaning |
|---|---|
| Confirmed | Attendee has a reserved spot |
| Waitlisted | Attendee is waiting for an opening |
| Canceled | Attendee canceled |
| Promoted | Attendee moved from waitlist to confirmed |
| Attended | Attendee checked in |
| No-show | Attendee registered but did not attend |

## Business Rules

**Capacity enforcement:** once an event reaches its seat limit, new registrants are placed on a waitlist and the event status changes to Full or Waitlisted.

**Automatic waitlist promotion:** when a confirmed attendee cancels, the first person on the waitlist is promoted to Confirmed and notified.

**Booth-level capacity:** for floor-plan events, a booth/space can only be held by one active registration at a time.

**No duplicate registrations:** one attendee can't double-register for the same event.

Optional additional rules under consideration: registration closes 24 hours before the event, reminders sent 24 hours before the event, and events cannot be edited after completion.

## Notifications

Automated notifications (registration confirmation, waitlist confirmation, waitlist promotion, event reminder, cancellation notice) via an external provider such as SendGrid, Resend, or the Gmail API. Currently simulated in-app via `lib/notifications.ts` — see [Data layer](#data-layer-temporary-swappable) below.

## AI Features

- Generate event descriptions
- Suggest reminder messages
- Create post-event follow-up emails
- Summarize registration trends
- Flag events likely to exceed capacity
- Recommend whether to open a second session (e.g. "Based on current registrations and waitlist size, suggest whether the organizer should add another session.")

Currently implemented as templated placeholders in `lib/ai.ts` — swap in a real Claude API call when ready.

## Status

Implementation of the app shell is underway. See `ARCHITECTURE.md` for the planned Vercel + Neon deployment target.

### What's built

- **Vendor registration** (`/vendor`) — survey-style forms, event browsing, and a venue floor-plan booth picker.
- **Event Planner operations** (`/planner`) — a combined analytics + task dashboard, event lifecycle management, a floor-plan builder (templates, drag-to-place, image upload to trace), a vendor directory, a notifications log, and a Users & Access portal.
- **Auth** — email + password on first sign-in, then a fast PIN unlock on the same device afterward (see `lib/auth.ts`).
- **Role-based access** — `admin` / `planner` / `staff` / `vendor`, enforced both by `proxy.ts` (session presence) and by each layout (`app/planner/layout.tsx`, `app/vendor/layout.tsx`) re-checking the real role server-side. Admins/planners can toggle into a live "preview" of the vendor experience.

### Data layer (temporary, swappable)

Everything currently lives in an in-memory seeded store (`lib/data/store.ts`, `lib/data/seed.ts`) behind small functions in `lib/data/*.ts`. When the real database is ready (Neon per `ARCHITECTURE.md`), swap the bodies of those functions for real queries — the UI and business-rule logic don't need to change.

### Demo accounts

Password for all staff accounts: `password123`

| Email | Role |
|---|---|
| admin@lipscomb.edu | Admin |
| planner@lipscomb.edu | Event Planner |
| staff@lipscomb.edu | Staff |
| vendor@lipscomb.edu | Vendor (Lee's BBQ Co.) |

### Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Next steps

- Add Neon (Postgres) and port `lib/data/*.ts` to it, per `ARCHITECTURE.md`.
- Wire up a real email provider in `lib/notifications.ts` and the Claude API in `lib/ai.ts`.
- Connect to Vercel for preview/production deploys.

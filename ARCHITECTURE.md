# Architecture

This document describes the high-level architecture for the **Event Planner** application.

## Overview

The app is deployed on **Vercel** and uses **Neon** (serverless PostgreSQL) as its database.

```
┌──────────────┐        ┌─────────────────────┐        ┌──────────────┐
│   Browser    │  HTTPS │       Vercel        │   SQL  │     Neon     │
│  (frontend)  │ ─────► │  (hosting + API)    │ ─────► │ (PostgreSQL) │
└──────────────┘        └─────────────────────┘        └──────────────┘
```

## Hosting — Vercel

- Hosts the frontend and serverless API routes.
- Handles builds and deployments automatically on every push to GitHub.
- **Production** deploys come from the `main` branch.
- **Preview** deploys are created automatically for every other branch / pull request.
- Environment variables (such as the database connection string) are configured in the Vercel project settings.

## Database — Neon

- Serverless PostgreSQL database that stores the application's data.
- Scales to zero when idle and supports database branching for testing.
- The app connects using a connection string stored in the `DATABASE_URL` environment variable.

### Example tables (event planner domain)

| Table      | Purpose                                  |
| ---------- | ---------------------------------------- |
| `users`    | People who create and manage events      |
| `events`   | Individual events (title, date, location)|
| `guests`   | Invitees linked to an event              |
| `rsvps`    | Guest responses (yes / no / maybe)       |
| `tasks`    | To-do items associated with an event     |

## Environment variables

| Variable       | Description                                   |
| -------------- | --------------------------------------------- |
| `DATABASE_URL` | Neon PostgreSQL connection string             |

## Deployment flow

1. Push code to GitHub.
2. Vercel detects the push and runs a build.
3. The app connects to Neon using `DATABASE_URL`.
4. Vercel serves the deployed application.

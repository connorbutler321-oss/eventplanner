import net from "node:net";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { seedUsers, seedEvents, seedAttendees, seedFloorPlans, seedTasks } from "./seed";

// Node's happy-eyeballs connector gives each address only 250ms by default;
// on higher-latency networks the TLS connect to Neon can exceed that and
// every attempt gets killed, surfacing as intermittent ETIMEDOUT. Give
// attempts a more forgiving window.
if (typeof net.setDefaultAutoSelectFamilyAttemptTimeout === "function") {
  net.setDefaultAutoSelectFamilyAttemptTimeout(2500);
}

// Neon Postgres data layer.
//
// `db()` returns Neon's tagged-template query function, guaranteeing the
// schema exists (and demo data is seeded) before the first query runs. The
// bootstrap runs once per server instance and is stashed on `globalThis` so
// Next.js Fast Refresh doesn't re-run it on every edit during `next dev`.
//
// On Vercel, DATABASE_URL is injected by the Neon integration (production
// gets the production branch; preview deployments get their own database
// branch). Locally, put it in `.env.local` — see README.

type Sql = NeonQueryFunction<false, false>;

declare global {
  var __eventflowDbReady: Promise<void> | undefined;
}

let _sql: Sql | null = null;

function rawSql(): Sql {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Locally: add your Neon connection string to .env.local. On Vercel: connect the Neon integration (Storage tab)."
      );
    }
    _sql = neon(url);
  }
  return _sql;
}

export function nextId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

async function createSchemaAndSeed(): Promise<void> {
  const sql = rawSql();

  // Dates are stored as TEXT (ISO-8601 strings) to round-trip the string
  // types in lib/types.ts exactly; ISO strings also sort chronologically.
  await sql`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    pin TEXT NOT NULL,
    role TEXT NOT NULL,
    attendee_id TEXT,
    created_at TEXT NOT NULL,
    last_login TEXT
  )`;
  await sql`CREATE TABLE IF NOT EXISTS attendees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    business_name TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    category TEXT NOT NULL
  )`;
  await sql`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    status TEXT NOT NULL,
    floor_plan_id TEXT,
    created_at TEXT NOT NULL
  )`;
  await sql`CREATE TABLE IF NOT EXISTS floor_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_template BOOLEAN NOT NULL DEFAULT FALSE,
    background_image_url TEXT,
    canvas_width INTEGER NOT NULL,
    canvas_height INTEGER NOT NULL,
    spaces JSONB NOT NULL DEFAULT '[]'::jsonb
  )`;
  await sql`CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    attendee_id TEXT NOT NULL,
    status TEXT NOT NULL,
    booth_id TEXT,
    form_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`;
  await sql`CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    registration_id TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'email',
    sent_at TEXT NOT NULL
  )`;
  await sql`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    detail TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    event_id TEXT
  )`;

  // Seed demo data once, on an empty database. Preview-branch databases are
  // copies of production, so they arrive already populated and skip this.
  const [{ count }] = (await sql`SELECT count(*)::int AS count FROM users`) as { count: number }[];
  if (count > 0) return;

  for (const u of seedUsers()) {
    await sql`INSERT INTO users (id, name, email, password, pin, role, attendee_id, created_at, last_login)
      VALUES (${u.id}, ${u.name}, ${u.email}, ${u.password}, ${u.pin}, ${u.role}, ${u.attendeeId ?? null}, ${u.createdAt}, ${u.lastLogin ?? null})
      ON CONFLICT (id) DO NOTHING`;
  }
  for (const a of seedAttendees()) {
    await sql`INSERT INTO attendees (id, name, business_name, email, phone, category)
      VALUES (${a.id}, ${a.name}, ${a.businessName ?? null}, ${a.email}, ${a.phone}, ${a.category})
      ON CONFLICT (id) DO NOTHING`;
  }
  for (const e of seedEvents()) {
    await sql`INSERT INTO events (id, name, description, category, date, location, capacity, status, floor_plan_id, created_at)
      VALUES (${e.id}, ${e.name}, ${e.description}, ${e.category}, ${e.date}, ${e.location}, ${e.capacity}, ${e.status}, ${e.floorPlanId ?? null}, ${e.createdAt})
      ON CONFLICT (id) DO NOTHING`;
  }
  for (const f of seedFloorPlans()) {
    await sql`INSERT INTO floor_plans (id, name, is_template, background_image_url, canvas_width, canvas_height, spaces)
      VALUES (${f.id}, ${f.name}, ${f.isTemplate}, ${f.backgroundImageUrl ?? null}, ${f.canvasWidth}, ${f.canvasHeight}, ${JSON.stringify(f.spaces)}::jsonb)
      ON CONFLICT (id) DO NOTHING`;
  }
  for (const t of seedTasks()) {
    await sql`INSERT INTO tasks (id, title, detail, done, event_id)
      VALUES (${t.id}, ${t.title}, ${t.detail}, ${t.done}, ${t.eventId ?? null})
      ON CONFLICT (id) DO NOTHING`;
  }
}

function ensureDb(): Promise<void> {
  if (!globalThis.__eventflowDbReady) {
    globalThis.__eventflowDbReady = createSchemaAndSeed().catch((err) => {
      // Allow the next request to retry instead of caching the failure.
      globalThis.__eventflowDbReady = undefined;
      throw err;
    });
  }
  return globalThis.__eventflowDbReady;
}

/** Returns the query function once the schema is guaranteed to exist. */
export async function db(): Promise<Sql> {
  await ensureDb();
  return rawSql();
}

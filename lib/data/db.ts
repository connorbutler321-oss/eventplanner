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
    access_mode TEXT,
    created_at TEXT NOT NULL,
    last_login TEXT
  )`;
  // Migration for databases created before planner access modes existed.
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS access_mode TEXT`;
  // Default existing planners to request mode. Only touches rows never set, so
  // a planner an admin later grants full access to is left alone.
  await sql`UPDATE users SET access_mode = 'request' WHERE role = 'planner' AND access_mode IS NULL`;
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
  await sql`CREATE TABLE IF NOT EXISTS change_requests (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    requested_by TEXT NOT NULL,
    target_id TEXT,
    summary TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TEXT NOT NULL,
    decided_by TEXT,
    decided_at TEXT,
    decline_reason TEXT
  )`;
  // Ledger of seed records already applied to this database. Seeding is keyed
  // off this rather than "is the database empty?", so that seed entries added
  // later (e.g. a new team login) still reach an existing database, while a
  // record deleted through the app stays deleted instead of reappearing.
  await sql`CREATE TABLE IF NOT EXISTS seed_history (
    seed_key TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`;

  const appliedRows = (await sql`SELECT seed_key FROM seed_history`) as { seed_key: string }[];
  const applied = new Set(appliedRows.map((r) => r.seed_key));
  const newKeys: string[] = [];

  // Rows are inserted one statement per table (via jsonb_to_recordset) rather
  // than one statement per row: seeding a fresh database is ~5 round trips
  // instead of ~30, which keeps it well inside a serverless request budget.
  function unapplied<T>(prefix: string, rows: T[], id: (row: T) => string): T[] {
    return rows.filter((row) => {
      const key = `${prefix}:${id(row)}`;
      if (applied.has(key)) return false;
      newKeys.push(key);
      return true;
    });
  }

  const users = unapplied("user", seedUsers(), (u) => u.id).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    password: u.password,
    pin: u.pin,
    role: u.role,
    attendee_id: u.attendeeId ?? null,
    access_mode: u.role === "planner" ? "request" : null,
    created_at: u.createdAt,
    last_login: u.lastLogin ?? null,
  }));
  if (users.length) {
    await sql`INSERT INTO users (id, name, email, password, pin, role, attendee_id, access_mode, created_at, last_login)
      SELECT id, name, email, password, pin, role, attendee_id, access_mode, created_at, last_login
      FROM jsonb_to_recordset(${JSON.stringify(users)}::jsonb)
      AS x(id text, name text, email text, password text, pin text, role text, attendee_id text, access_mode text, created_at text, last_login text)
      ON CONFLICT (id) DO NOTHING`;
  }

  const attendees = unapplied("attendee", seedAttendees(), (a) => a.id).map((a) => ({
    id: a.id,
    name: a.name,
    business_name: a.businessName ?? null,
    email: a.email,
    phone: a.phone,
    category: a.category,
  }));
  if (attendees.length) {
    await sql`INSERT INTO attendees (id, name, business_name, email, phone, category)
      SELECT id, name, business_name, email, phone, category
      FROM jsonb_to_recordset(${JSON.stringify(attendees)}::jsonb)
      AS x(id text, name text, business_name text, email text, phone text, category text)
      ON CONFLICT (id) DO NOTHING`;
  }

  const events = unapplied("event", seedEvents(), (e) => e.id).map((e) => ({
    id: e.id,
    name: e.name,
    description: e.description,
    category: e.category,
    date: e.date,
    location: e.location,
    capacity: e.capacity,
    status: e.status,
    floor_plan_id: e.floorPlanId ?? null,
    created_at: e.createdAt,
  }));
  if (events.length) {
    await sql`INSERT INTO events (id, name, description, category, date, location, capacity, status, floor_plan_id, created_at)
      SELECT id, name, description, category, date, location, capacity, status, floor_plan_id, created_at
      FROM jsonb_to_recordset(${JSON.stringify(events)}::jsonb)
      AS x(id text, name text, description text, category text, date text, location text, capacity int, status text, floor_plan_id text, created_at text)
      ON CONFLICT (id) DO NOTHING`;
  }

  const floorPlans = unapplied("floorplan", seedFloorPlans(), (f) => f.id).map((f) => ({
    id: f.id,
    name: f.name,
    is_template: f.isTemplate,
    background_image_url: f.backgroundImageUrl ?? null,
    canvas_width: f.canvasWidth,
    canvas_height: f.canvasHeight,
    spaces: f.spaces,
  }));
  if (floorPlans.length) {
    await sql`INSERT INTO floor_plans (id, name, is_template, background_image_url, canvas_width, canvas_height, spaces)
      SELECT id, name, is_template, background_image_url, canvas_width, canvas_height, spaces
      FROM jsonb_to_recordset(${JSON.stringify(floorPlans)}::jsonb)
      AS x(id text, name text, is_template boolean, background_image_url text, canvas_width int, canvas_height int, spaces jsonb)
      ON CONFLICT (id) DO NOTHING`;
  }

  const tasks = unapplied("task", seedTasks(), (t) => t.id).map((t) => ({
    id: t.id,
    title: t.title,
    detail: t.detail,
    done: t.done,
    event_id: t.eventId ?? null,
  }));
  if (tasks.length) {
    await sql`INSERT INTO tasks (id, title, detail, done, event_id)
      SELECT id, title, detail, done, event_id
      FROM jsonb_to_recordset(${JSON.stringify(tasks)}::jsonb)
      AS x(id text, title text, detail text, done boolean, event_id text)
      ON CONFLICT (id) DO NOTHING`;
  }

  if (newKeys.length === 0) return;
  // Record in one statement so the ledger costs a single round trip.
  await sql`INSERT INTO seed_history (seed_key, applied_at)
    SELECT unnest(${newKeys}::text[]), ${new Date().toISOString()}
    ON CONFLICT (seed_key) DO NOTHING`;
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

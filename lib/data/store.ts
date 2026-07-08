import type {
  User,
  EventRecord,
  Attendee,
  Registration,
  NotificationRecord,
  FloorPlan,
  TaskItem,
} from "@/lib/types";
import { seedUsers, seedEvents, seedAttendees, seedFloorPlans, seedTasks } from "./seed";

// In-memory data store for the app shell.
//
// This is intentionally the ONLY place that holds mutable "database" state.
// A teammate wiring up a real database should be able to replace the bodies
// of the functions in events.ts / attendees.ts / registrations.ts / etc.
// with real queries and delete this file, without the UI changing at all.
//
// We stash the store on `globalThis` so Next.js Fast Refresh (which re-runs
// modules on file edits during `next dev`) doesn't wipe out data you entered
// while testing the app.

interface Store {
  users: User[];
  events: EventRecord[];
  attendees: Attendee[];
  registrations: Registration[];
  notifications: NotificationRecord[];
  floorPlans: FloorPlan[];
  tasks: TaskItem[];
}

declare global {
  var __eventflowStore: Store | undefined;
}

function createStore(): Store {
  return {
    users: seedUsers(),
    events: seedEvents(),
    attendees: seedAttendees(),
    registrations: [],
    notifications: [],
    floorPlans: seedFloorPlans(),
    tasks: seedTasks(),
  };
}

export const store: Store = globalThis.__eventflowStore ?? createStore();
globalThis.__eventflowStore = store;

export function nextId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

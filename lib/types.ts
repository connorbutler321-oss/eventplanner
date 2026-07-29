// Core domain types for EventFlow AI.
// This file is the contract between the UI and the data layer (lib/data/*).
// Swapping the mock in-memory store for a real database should not require
// changing these shapes.

export type Role = "admin" | "planner" | "staff" | "vendor";

export type EventStatus =
  | "Draft"
  | "Open"
  | "Full"
  | "Waitlisted"
  | "Closed"
  | "Completed"
  | "Canceled";

export type RegistrationStatus =
  | "Confirmed"
  | "Waitlisted"
  | "Canceled"
  | "Promoted"
  | "Attended"
  | "No-show";

export type NotificationType =
  | "confirmation"
  | "waitlist"
  | "promotion"
  | "reminder"
  | "cancellation";

// Controls how much a planner-side user can change:
//   - "full"    — applies event/floor-plan changes directly
//   - "request" — planner changes are queued for admin approval (see ChangeRequest)
//   - "view"    — read-only; cannot create or change events/floor plans
// Planners default to "request", staff default to "view", admins are always full.
export type AccessMode = "full" | "request" | "view";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // mock plaintext — swap for a real hash + provider later
  pin: string; // 4-6 digit mock PIN
  role: Role;
  attendeeId?: string; // for vendor-role users, links the login to their Attendee/business profile
  accessMode?: AccessMode; // planner-only; undefined behaves as "full"
  createdAt: string;
  lastLogin?: string;
}

export interface EventRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  date: string; // ISO date
  location: string;
  capacity: number;
  status: EventStatus;
  floorPlanId?: string;
  createdAt: string;
  createdBy?: string; // id of the user who created the event (unset for seeded events)
}

export interface Attendee {
  id: string;
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  category: string;
}

export interface Registration {
  id: string;
  eventId: string;
  attendeeId: string;
  status: RegistrationStatus;
  boothId?: string;
  formAnswers: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  registrationId: string;
  type: NotificationType;
  message: string;
  channel: "email";
  sentAt: string;
}

export type SpaceType =
  | "booth"
  | "table" // rectangular table
  | "roundtable"
  | "chair"
  | "door"
  | "wall"
  | "stage"
  | "walkway"
  | "entrance";
export type SpaceStatus = "available" | "reserved" | "blocked";

export interface FloorPlanSpace {
  id: string;
  label: string;
  type: SpaceType;
  x: number;
  y: number;
  w: number;
  h: number;
  status: SpaceStatus;
  price?: number;
}

export interface FloorPlan {
  id: string;
  name: string;
  isTemplate: boolean;
  backgroundImageUrl?: string;
  canvasWidth: number;
  canvasHeight: number;
  spaces: FloorPlanSpace[];
}

export interface TaskItem {
  id: string;
  title: string;
  detail: string;
  done: boolean;
  eventId?: string;
}

// A change proposed by a request-mode planner, awaiting an admin decision.
// The proposed change lives entirely in `payload`; the live event/floor plan
// is not touched until an admin approves it.
export type ChangeRequestType = "event.create" | "event.update" | "event.status" | "floorplan.update";
export type ChangeRequestStatus = "pending" | "approved" | "declined";

export interface ChangeRequest {
  id: string;
  type: ChangeRequestType;
  status: ChangeRequestStatus;
  requestedBy: string; // user id of the planner who submitted it
  targetId?: string; // event/floor-plan id being changed (unset for event.create)
  summary: string; // human-readable description shown in the approvals queue
  payload: Record<string, unknown>; // the proposed change, shape depends on `type`
  createdAt: string;
  decidedBy?: string; // admin user id
  decidedAt?: string;
  declineReason?: string;
}

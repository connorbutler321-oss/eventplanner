import { db, nextId } from "./db";
import type {
  ChangeRequest,
  ChangeRequestStatus,
  ChangeRequestType,
  EventStatus,
} from "@/lib/types";
import { createEvent, updateEvent } from "./events";
import { cloneFloorPlanFromTemplate, updateFloorPlan, resolveFloorPlanChoice } from "./floorplans";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRequest(row: any): ChangeRequest {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    requestedBy: row.requested_by,
    targetId: row.target_id ?? undefined,
    summary: row.summary,
    payload: row.payload as Record<string, unknown>,
    createdAt: row.created_at,
    decidedBy: row.decided_by ?? undefined,
    decidedAt: row.decided_at ?? undefined,
    declineReason: row.decline_reason ?? undefined,
  };
}

// The event-field shape shared by create/update payloads.
interface EventFields {
  name: string;
  description: string;
  category: string;
  date: string;
  location: string;
  capacity: number;
}

export async function createChangeRequest(input: {
  type: ChangeRequestType;
  requestedBy: string;
  targetId?: string;
  summary: string;
  payload: Record<string, unknown>;
}): Promise<ChangeRequest> {
  const request: ChangeRequest = {
    id: nextId("req"),
    status: "pending",
    createdAt: new Date().toISOString(),
    ...input,
  };
  const sql = await db();
  await sql`INSERT INTO change_requests (id, type, status, requested_by, target_id, summary, payload, created_at)
    VALUES (${request.id}, ${request.type}, ${request.status}, ${request.requestedBy}, ${request.targetId ?? null}, ${request.summary}, ${JSON.stringify(request.payload)}::jsonb, ${request.createdAt})`;
  return request;
}

export async function getChangeRequests(): Promise<ChangeRequest[]> {
  const sql = await db();
  const rows = await sql`SELECT * FROM change_requests ORDER BY created_at DESC`;
  return rows.map(mapRequest);
}

export async function getPendingChangeRequests(): Promise<ChangeRequest[]> {
  const sql = await db();
  const rows = await sql`SELECT * FROM change_requests WHERE status = 'pending' ORDER BY created_at`;
  return rows.map(mapRequest);
}

export async function getChangeRequestsForUser(userId: string): Promise<ChangeRequest[]> {
  const sql = await db();
  const rows = await sql`SELECT * FROM change_requests WHERE requested_by = ${userId} ORDER BY created_at DESC`;
  return rows.map(mapRequest);
}

export async function getChangeRequestById(id: string): Promise<ChangeRequest | undefined> {
  const sql = await db();
  const rows = await sql`SELECT * FROM change_requests WHERE id = ${id}`;
  return rows[0] ? mapRequest(rows[0]) : undefined;
}

export async function countPendingChangeRequests(): Promise<number> {
  const sql = await db();
  const rows = await sql`SELECT count(*)::int AS count FROM change_requests WHERE status = 'pending'`;
  return rows[0].count;
}

export async function countPendingChangeRequestsForUser(userId: string): Promise<number> {
  const sql = await db();
  const rows = await sql`SELECT count(*)::int AS count FROM change_requests WHERE status = 'pending' AND requested_by = ${userId}`;
  return rows[0].count;
}

// Applies a pending request's proposed change to the live data. Kept private —
// callers go through approveChangeRequest so the request is also marked decided.
async function applyRequest(request: ChangeRequest): Promise<void> {
  switch (request.type) {
    case "event.create": {
      const { fields, templateId } = request.payload as { fields: EventFields; templateId?: string };
      let floorPlanId: string | undefined;
      if (templateId) {
        const plan = await cloneFloorPlanFromTemplate(templateId, `${fields.name} Layout`);
        floorPlanId = plan.id;
      }
      await createEvent({ ...fields, floorPlanId, createdBy: request.requestedBy });
      break;
    }
    case "event.update": {
      const { fields } = request.payload as { fields: EventFields };
      if (request.targetId) await updateEvent(request.targetId, fields);
      break;
    }
    case "event.status": {
      const { status } = request.payload as { status: EventStatus };
      if (request.targetId) await updateEvent(request.targetId, { status });
      break;
    }
    case "event.floorplan": {
      const { choice, eventName } = request.payload as { choice: string; eventName: string };
      if (request.targetId) {
        const floorPlanId = await resolveFloorPlanChoice(choice, eventName);
        await updateEvent(request.targetId, { floorPlanId });
      }
      break;
    }
    case "floorplan.update": {
      const { input } = request.payload as {
        input: Parameters<typeof updateFloorPlan>[1];
      };
      if (request.targetId) await updateFloorPlan(request.targetId, input);
      break;
    }
  }
}

async function markDecided(
  id: string,
  status: Exclude<ChangeRequestStatus, "pending">,
  decidedBy: string,
  declineReason?: string
): Promise<ChangeRequest | null> {
  const sql = await db();
  const now = new Date().toISOString();
  const rows = await sql`UPDATE change_requests
    SET status = ${status}, decided_by = ${decidedBy}, decided_at = ${now}, decline_reason = ${declineReason ?? null}
    WHERE id = ${id} AND status = 'pending'
    RETURNING *`;
  return rows[0] ? mapRequest(rows[0]) : null;
}

export async function approveChangeRequest(id: string, adminId: string): Promise<ChangeRequest | null> {
  const request = await getChangeRequestById(id);
  if (!request || request.status !== "pending") return null;
  await applyRequest(request);
  return markDecided(id, "approved", adminId);
}

export async function declineChangeRequest(
  id: string,
  adminId: string,
  reason?: string
): Promise<ChangeRequest | null> {
  const request = await getChangeRequestById(id);
  if (!request || request.status !== "pending") return null;
  return markDecided(id, "declined", adminId, reason);
}

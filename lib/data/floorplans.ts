import { db, nextId } from "./db";
import type { FloorPlan, FloorPlanSpace } from "@/lib/types";
import { RegistrationError } from "./registrations-errors";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapFloorPlan(row: any): FloorPlan {
  return {
    id: row.id,
    name: row.name,
    isTemplate: row.is_template,
    backgroundImageUrl: row.background_image_url ?? undefined,
    canvasWidth: row.canvas_width,
    canvasHeight: row.canvas_height,
    spaces: row.spaces as FloorPlanSpace[],
  };
}

export async function getFloorPlans(): Promise<FloorPlan[]> {
  const sql = await db();
  const rows = await sql`SELECT * FROM floor_plans ORDER BY is_template, name`;
  return rows.map(mapFloorPlan);
}

export async function getTemplates(): Promise<FloorPlan[]> {
  const sql = await db();
  const rows = await sql`SELECT * FROM floor_plans WHERE is_template ORDER BY name`;
  return rows.map(mapFloorPlan);
}

export async function getFloorPlanById(id?: string): Promise<FloorPlan | undefined> {
  if (!id) return undefined;
  const sql = await db();
  const rows = await sql`SELECT * FROM floor_plans WHERE id = ${id}`;
  return rows[0] ? mapFloorPlan(rows[0]) : undefined;
}

/**
 * Flips one space's status inside the plan's JSONB `spaces` array. The WHERE
 * guard makes the write conditional on the space still being in
 * `fromStatus`, so two concurrent reservations can't both win.
 */
async function setSpaceStatus(
  floorPlanId: string,
  spaceId: string,
  fromStatus: string,
  toStatus: string
): Promise<boolean> {
  const sql = await db();
  const rows = await sql`UPDATE floor_plans SET spaces = (
      SELECT jsonb_agg(
        CASE WHEN e->>'id' = ${spaceId} THEN jsonb_set(e, '{status}', to_jsonb(${toStatus}::text)) ELSE e END
      )
      FROM jsonb_array_elements(spaces) e
    )
    WHERE id = ${floorPlanId}
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(spaces) e
        WHERE e->>'id' = ${spaceId} AND e->>'status' = ${fromStatus}
      )
    RETURNING id`;
  return rows.length > 0;
}

export async function reserveSpace(floorPlanId: string | undefined, spaceId: string): Promise<void> {
  const plan = await getFloorPlanById(floorPlanId);
  if (!plan) return; // events without a floor plan just skip spatial booking
  const space = plan.spaces.find((s) => s.id === spaceId);
  if (!space) throw new RegistrationError("Selected space does not exist on this floor plan.");
  if (space.status !== "available") {
    throw new RegistrationError(`Space "${space.label}" is no longer available.`);
  }
  const reserved = await setSpaceStatus(plan.id, spaceId, "available", "reserved");
  if (!reserved) {
    throw new RegistrationError(`Space "${space.label}" is no longer available.`);
  }
}

export async function releaseSpace(floorPlanId: string | undefined, spaceId: string): Promise<void> {
  if (!floorPlanId) return;
  await setSpaceStatus(floorPlanId, spaceId, "reserved", "available");
}

export async function createFloorPlan(input: {
  name: string;
  isTemplate: boolean;
  canvasWidth: number;
  canvasHeight: number;
  backgroundImageUrl?: string;
  spaces?: FloorPlanSpace[];
}): Promise<FloorPlan> {
  const plan: FloorPlan = { id: nextId("fp"), spaces: [], ...input };
  const sql = await db();
  await sql`INSERT INTO floor_plans (id, name, is_template, background_image_url, canvas_width, canvas_height, spaces)
    VALUES (${plan.id}, ${plan.name}, ${plan.isTemplate}, ${plan.backgroundImageUrl ?? null}, ${plan.canvasWidth}, ${plan.canvasHeight}, ${JSON.stringify(plan.spaces)}::jsonb)`;
  return plan;
}

export async function cloneFloorPlanFromTemplate(templateId: string, name: string): Promise<FloorPlan> {
  const template = await getFloorPlanById(templateId);
  if (!template) throw new RegistrationError("Template not found.");
  return createFloorPlan({
    name,
    isTemplate: false,
    canvasWidth: template.canvasWidth,
    canvasHeight: template.canvasHeight,
    backgroundImageUrl: template.backgroundImageUrl,
    spaces: template.spaces.map((s) => ({ ...s, id: nextId("s"), status: "available" as const })),
  });
}

export async function updateFloorPlan(
  id: string,
  patch: Partial<Pick<FloorPlan, "name" | "backgroundImageUrl" | "spaces" | "canvasWidth" | "canvasHeight">>
): Promise<FloorPlan | null> {
  const existing = await getFloorPlanById(id);
  if (!existing) return null;
  const merged = { ...existing, ...patch };
  const sql = await db();
  await sql`UPDATE floor_plans
    SET name = ${merged.name}, background_image_url = ${merged.backgroundImageUrl ?? null},
        canvas_width = ${merged.canvasWidth}, canvas_height = ${merged.canvasHeight},
        spaces = ${JSON.stringify(merged.spaces)}::jsonb
    WHERE id = ${id}`;
  return merged;
}

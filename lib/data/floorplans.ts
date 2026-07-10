import { store, nextId } from "./store";
import type { FloorPlan, FloorPlanSpace } from "@/lib/types";
import { RegistrationError } from "./registrations-errors";

export function getFloorPlans(): FloorPlan[] {
  return store.floorPlans;
}

export function getTemplates(): FloorPlan[] {
  return store.floorPlans.filter((f) => f.isTemplate);
}

export function getFloorPlanById(id?: string): FloorPlan | undefined {
  if (!id) return undefined;
  return store.floorPlans.find((f) => f.id === id);
}

export function reserveSpace(floorPlanId: string | undefined, spaceId: string): void {
  const plan = getFloorPlanById(floorPlanId);
  if (!plan) return; // events without a floor plan just skip spatial booking
  const space = plan.spaces.find((s) => s.id === spaceId);
  if (!space) throw new RegistrationError("Selected space does not exist on this floor plan.");
  if (space.status !== "available") {
    throw new RegistrationError(`Space "${space.label}" is no longer available.`);
  }
  space.status = "reserved";
}

export function releaseSpace(floorPlanId: string | undefined, spaceId: string): void {
  const plan = getFloorPlanById(floorPlanId);
  if (!plan) return;
  const space = plan.spaces.find((s) => s.id === spaceId);
  if (space && space.status === "reserved") {
    space.status = "available";
  }
}

export function createFloorPlan(input: {
  name: string;
  isTemplate: boolean;
  canvasWidth: number;
  canvasHeight: number;
  backgroundImageUrl?: string;
  spaces?: FloorPlanSpace[];
}): FloorPlan {
  const plan: FloorPlan = { id: nextId("fp"), spaces: [], ...input };
  store.floorPlans.push(plan);
  return plan;
}

export function cloneFloorPlanFromTemplate(templateId: string, name: string): FloorPlan {
  const template = getFloorPlanById(templateId);
  if (!template) throw new RegistrationError("Template not found.");
  const plan: FloorPlan = {
    id: nextId("fp"),
    name,
    isTemplate: false,
    canvasWidth: template.canvasWidth,
    canvasHeight: template.canvasHeight,
    backgroundImageUrl: template.backgroundImageUrl,
    spaces: template.spaces.map((s) => ({ ...s, id: nextId("s"), status: "available" })),
  };
  store.floorPlans.push(plan);
  return plan;
}

export function updateFloorPlan(
  id: string,
  patch: Partial<Pick<FloorPlan, "name" | "backgroundImageUrl" | "spaces" | "canvasWidth" | "canvasHeight">>
): FloorPlan | null {
  const plan = getFloorPlanById(id);
  if (!plan) return null;
  Object.assign(plan, patch);
  return plan;
}

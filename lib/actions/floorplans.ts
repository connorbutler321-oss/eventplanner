"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUser, requiresApproval } from "@/lib/auth";
import { createFloorPlan, cloneFloorPlanFromTemplate, updateFloorPlan } from "@/lib/data/floorplans";
import { createChangeRequest } from "@/lib/data/requests";
import type { FloorPlanSpace } from "@/lib/types";

export async function createBlankFloorPlanAction(name: string): Promise<void> {
  const plan = await createFloorPlan({ name, isTemplate: false, canvasWidth: 560, canvasHeight: 360, spaces: [] });
  revalidatePath("/planner/floorplans");
  redirect(`/planner/floorplans/${plan.id}`);
}

export async function createFloorPlanFromTemplateAction(templateId: string, name: string): Promise<void> {
  const plan = await cloneFloorPlanFromTemplate(templateId, name);
  revalidatePath("/planner/floorplans");
  redirect(`/planner/floorplans/${plan.id}`);
}

export async function saveFloorPlanAction(
  planId: string,
  input: {
    name: string;
    backgroundImageUrl?: string;
    canvasWidth: number;
    canvasHeight: number;
    spaces: FloorPlanSpace[];
  }
): Promise<{ ok: true; queued: boolean }> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (requiresApproval(user)) {
    await createChangeRequest({
      type: "floorplan.update",
      requestedBy: user.id,
      targetId: planId,
      summary: `Edit floor plan “${input.name}”`,
      payload: { input },
    });
    revalidatePath("/planner/requests");
    return { ok: true, queued: true };
  }

  await updateFloorPlan(planId, input);
  revalidatePath(`/planner/floorplans/${planId}`);
  revalidatePath("/planner/floorplans");
  revalidatePath("/vendor");
  return { ok: true, queued: false };
}

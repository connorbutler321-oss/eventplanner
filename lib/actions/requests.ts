"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { approveChangeRequest, declineChangeRequest } from "@/lib/data/requests";

// Approving/declining requests is admin-only. The page guard protects the UI;
// these endpoints re-check because a Server Action is a reachable POST.

function revalidateAfterDecision() {
  revalidatePath("/planner/requests");
  revalidatePath("/planner/events");
  revalidatePath("/planner/floorplans");
  revalidatePath("/planner");
  revalidatePath("/vendor");
}

export async function approveRequestAction(requestId: string): Promise<void> {
  const admin = await requireAdmin();
  await approveChangeRequest(requestId, admin.id);
  revalidateAfterDecision();
}

export async function declineRequestAction(requestId: string, reason?: string): Promise<void> {
  const admin = await requireAdmin();
  await declineChangeRequest(requestId, admin.id, reason?.trim() || undefined);
  revalidateAfterDecision();
}

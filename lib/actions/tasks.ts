"use server";

import { revalidatePath } from "next/cache";
import { toggleTask } from "@/lib/data/tasks";

export async function toggleTaskAction(taskId: string): Promise<void> {
  await toggleTask(taskId);
  revalidatePath("/planner");
}

"use server";

import { revalidatePath } from "next/cache";
import { toggleTask } from "@/lib/data/tasks";

export async function toggleTaskAction(taskId: string): Promise<void> {
  toggleTask(taskId);
  revalidatePath("/planner");
}

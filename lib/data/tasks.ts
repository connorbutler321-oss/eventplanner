import { store } from "./store";
import type { TaskItem } from "@/lib/types";

export function getTasks(): TaskItem[] {
  return store.tasks;
}

export function toggleTask(id: string): TaskItem | null {
  const task = store.tasks.find((t) => t.id === id);
  if (!task) return null;
  task.done = !task.done;
  return task;
}

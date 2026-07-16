import { db } from "./db";
import type { TaskItem } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapTask(row: any): TaskItem {
  return {
    id: row.id,
    title: row.title,
    detail: row.detail,
    done: row.done,
    eventId: row.event_id ?? undefined,
  };
}

export async function getTasks(): Promise<TaskItem[]> {
  const sql = await db();
  const rows = await sql`SELECT * FROM tasks ORDER BY id`;
  return rows.map(mapTask);
}

export async function toggleTask(id: string): Promise<TaskItem | null> {
  const sql = await db();
  const rows = await sql`UPDATE tasks SET done = NOT done WHERE id = ${id} RETURNING *`;
  return rows[0] ? mapTask(rows[0]) : null;
}

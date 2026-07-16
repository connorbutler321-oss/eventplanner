import { db, nextId } from "./db";
import type { NotificationRecord, NotificationType } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapNotification(row: any): NotificationRecord {
  return {
    id: row.id,
    registrationId: row.registration_id,
    type: row.type,
    message: row.message,
    channel: row.channel,
    sentAt: row.sent_at,
  };
}

export async function getNotifications(): Promise<NotificationRecord[]> {
  const sql = await db();
  const rows = await sql`SELECT * FROM notifications ORDER BY sent_at DESC`;
  return rows.map(mapNotification);
}

export async function logNotification(input: {
  registrationId: string;
  type: NotificationType;
  message: string;
}): Promise<NotificationRecord> {
  const record: NotificationRecord = {
    id: nextId("n"),
    channel: "email",
    sentAt: new Date().toISOString(),
    ...input,
  };
  const sql = await db();
  await sql`INSERT INTO notifications (id, registration_id, type, message, channel, sent_at)
    VALUES (${record.id}, ${record.registrationId}, ${record.type}, ${record.message}, ${record.channel}, ${record.sentAt})`;
  return record;
}

import { store, nextId } from "./store";
import type { NotificationRecord, NotificationType } from "@/lib/types";

export function getNotifications(): NotificationRecord[] {
  return [...store.notifications].sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

export function logNotification(input: {
  registrationId: string;
  type: NotificationType;
  message: string;
}): NotificationRecord {
  const record: NotificationRecord = {
    id: nextId("n"),
    channel: "email",
    sentAt: new Date().toISOString(),
    ...input,
  };
  store.notifications.push(record);
  return record;
}

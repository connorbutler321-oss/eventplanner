import { logNotification } from "@/lib/data/notifications";
import type { NotificationType } from "@/lib/types";

// --- Notification provider seam ---------------------------------------
// This is the ONLY place that should talk to an external email/SMS
// provider. Right now it just logs to the in-app Notifications center so
// the shell is fully demo-able without API keys. To go live, swap the
// body of `dispatch()` for a real SendGrid / Resend / Gmail API call and
// keep the same function signature.

async function dispatch(message: string, type: NotificationType): Promise<void> {
  // TODO(real integration): call SendGrid/Resend/Gmail API here.
  console.log(`[notifications:stub] (${type}) would send email: "${message}"`);
}

export function sendNotification(input: {
  registrationId: string;
  type: NotificationType;
  message: string;
}): void {
  logNotification(input);
  void dispatch(input.message, input.type);
}

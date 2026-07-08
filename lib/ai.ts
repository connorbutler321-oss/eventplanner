"use server";

import type { EventRecord } from "@/lib/types";

// --- AI assist seam ------------------------------------------------------
// These functions back the "AI-assist" buttons across the planner UI.
// They currently return templated placeholder text so the shell works with
// no API key configured. Swap the bodies for real Claude API calls
// (https://docs.claude.com) later — the function signatures are the
// contract the UI already depends on.

export async function generateEventDescription(input: {
  name: string;
  category: string;
  location: string;
}): Promise<string> {
  return `${input.name} is a ${input.category.toLowerCase()} event held at ${input.location}. Join us for a great time — more details coming soon. (AI-generated draft — edit before publishing.)`;
}

export async function suggestReminderMessage(event: EventRecord): Promise<string> {
  return `Reminder: "${event.name}" is coming up on ${new Date(event.date).toLocaleDateString()} at ${
    event.location
  }. We look forward to seeing you there! (AI-generated draft.)`;
}

export async function generateFollowUpEmail(event: EventRecord): Promise<string> {
  return `Thank you for taking part in "${event.name}"! We hope you had a great experience. We'd love to hear your feedback for next time. (AI-generated draft.)`;
}

export async function summarizeRegistrationTrends(input: {
  eventName: string;
  confirmed: number;
  waitlisted: number;
  capacity: number;
}): Promise<string> {
  const pctFull = input.capacity > 0 ? Math.round((input.confirmed / input.capacity) * 100) : 0;
  return `"${input.eventName}" is ${pctFull}% full (${input.confirmed}/${input.capacity} confirmed, ${input.waitlisted} waitlisted). (AI-generated summary — placeholder.)`;
}

export async function flagCapacityRisk(input: {
  confirmed: number;
  waitlisted: number;
  capacity: number;
}): Promise<{ atRisk: boolean; recommendation: string }> {
  const pctFull = input.capacity > 0 ? input.confirmed / input.capacity : 0;
  if (input.waitlisted > 0 && pctFull >= 1) {
    return {
      atRisk: true,
      recommendation: `This event is full with ${input.waitlisted} people on the waitlist. Consider opening a second session. (AI-generated recommendation — placeholder.)`,
    };
  }
  if (pctFull >= 0.8) {
    return {
      atRisk: true,
      recommendation: `This event is ${Math.round(pctFull * 100)}% full and trending toward capacity — keep an eye on it. (AI-generated recommendation — placeholder.)`,
    };
  }
  return { atRisk: false, recommendation: "No capacity concerns detected right now." };
}

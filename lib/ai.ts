"use server";

import Anthropic from "@anthropic-ai/sdk";
import type { EventRecord } from "@/lib/types";

// --- AI assist seam ------------------------------------------------------
// These functions back the "AI-assist" buttons across the planner UI.
// Each calls the real Claude API when ANTHROPIC_API_KEY is set; otherwise
// it falls back to the original templated placeholder text so the shell
// still works with no API key configured.

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

async function askClaude(system: string, prompt: string, fallback: string): Promise<string> {
  if (!client) return fallback;
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 300,
      system,
      messages: [{ role: "user", content: prompt }],
    });
    const text = message.content.find((block) => block.type === "text")?.text.trim();
    return text || fallback;
  } catch {
    // Network/API failure — degrade gracefully instead of breaking the UI.
    return fallback;
  }
}

export async function generateEventDescription(input: {
  name: string;
  category: string;
  location: string;
}): Promise<string> {
  const fallback = `${input.name} is a ${input.category.toLowerCase()} event held at ${input.location}. Join us for a great time — more details coming soon. (AI-generated draft — edit before publishing.)`;
  return askClaude(
    "You write short, inviting event descriptions (2-3 sentences) for a university event-planning tool. Return only the description text, no preamble or quotes.",
    `Event name: ${input.name}\nCategory: ${input.category}\nLocation: ${input.location}`,
    fallback
  );
}

export async function suggestReminderMessage(event: EventRecord): Promise<string> {
  const fallback = `Reminder: "${event.name}" is coming up on ${new Date(event.date).toLocaleDateString()} at ${
    event.location
  }. We look forward to seeing you there! (AI-generated draft.)`;
  return askClaude(
    "You write short, friendly reminder messages (1-2 sentences) for attendees of an upcoming university event. Return only the message text, no preamble or quotes.",
    `Event name: ${event.name}\nDate: ${new Date(event.date).toLocaleDateString()}\nLocation: ${event.location}`,
    fallback
  );
}

export async function generateFollowUpEmail(event: EventRecord): Promise<string> {
  const fallback = `Thank you for taking part in "${event.name}"! We hope you had a great experience. We'd love to hear your feedback for next time. (AI-generated draft.)`;
  return askClaude(
    "You write short, warm post-event follow-up messages (2-3 sentences) thanking attendees and inviting feedback, for a university event-planning tool. Return only the message text, no preamble or quotes.",
    `Event name: ${event.name}`,
    fallback
  );
}

export async function summarizeRegistrationTrends(input: {
  eventName: string;
  confirmed: number;
  waitlisted: number;
  capacity: number;
}): Promise<string> {
  const pctFull = input.capacity > 0 ? Math.round((input.confirmed / input.capacity) * 100) : 0;
  const fallback = `"${input.eventName}" is ${pctFull}% full (${input.confirmed}/${input.capacity} confirmed, ${input.waitlisted} waitlisted). (AI-generated summary — placeholder.)`;
  return askClaude(
    "You write short, informative one-sentence summaries of an event's registration trend for a university operations dashboard. Return only the summary text, no preamble or quotes.",
    `Event name: ${input.eventName}\nConfirmed: ${input.confirmed}\nWaitlisted: ${input.waitlisted}\nCapacity: ${input.capacity}\nPercent full: ${pctFull}%`,
    fallback
  );
}

function fallbackCapacityRisk(input: {
  confirmed: number;
  waitlisted: number;
  capacity: number;
}): { atRisk: boolean; recommendation: string } {
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

export async function flagCapacityRisk(input: {
  confirmed: number;
  waitlisted: number;
  capacity: number;
}): Promise<{ atRisk: boolean; recommendation: string }> {
  if (!client) {
    return fallbackCapacityRisk(input);
  }

  const pctFull = input.capacity > 0 ? input.confirmed / input.capacity : 0;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 200,
      system:
        "You are an operations assistant for a university event-planning tool. " +
        "Given an event's registration numbers, decide if it is at capacity risk " +
        "and give a short, specific, actionable recommendation (1-2 sentences). " +
        'Respond with ONLY a JSON object: {"atRisk": boolean, "recommendation": string}. No markdown, no extra text.',
      messages: [
        {
          role: "user",
          content: `confirmed: ${input.confirmed}, waitlisted: ${input.waitlisted}, capacity: ${input.capacity}, percent full: ${Math.round(pctFull * 100)}%`,
        },
      ],
    });

    const text = message.content.find((block) => block.type === "text")?.text ?? "";
    const parsed = JSON.parse(text);
    if (typeof parsed.atRisk === "boolean" && typeof parsed.recommendation === "string") {
      return parsed;
    }
    return fallbackCapacityRisk(input);
  } catch {
    // Network/parsing failure — degrade gracefully instead of breaking the dashboard.
    return fallbackCapacityRisk(input);
  }
}

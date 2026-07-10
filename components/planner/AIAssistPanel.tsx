"use client";

import { useState, useTransition } from "react";
import { suggestReminderMessage, generateFollowUpEmail, summarizeRegistrationTrends } from "@/lib/ai";
import type { EventRecord } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export function AIAssistPanel({
  event,
  confirmed,
  waitlisted,
}: {
  event: EventRecord;
  confirmed: number;
  waitlisted: number;
}) {
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(label: string, fn: () => Promise<string>) {
    startTransition(async () => {
      setResult(null);
      const text = await fn();
      setResult(`${label}: ${text}`);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={() => run("Reminder draft", () => suggestReminderMessage(event))}
        >
          ✨ Suggest reminder
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={() => run("Follow-up draft", () => generateFollowUpEmail(event))}
        >
          ✨ Follow-up email
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={() =>
            run("Trend summary", () =>
              summarizeRegistrationTrends({
                eventName: event.name,
                confirmed,
                waitlisted,
                capacity: event.capacity,
              })
            )
          }
        >
          ✨ Summarize trends
        </Button>
      </div>
      {pending && <p className="mt-3 text-xs text-gray-500">Generating…</p>}
      {result && !pending && (
        <p className="mt-3 rounded-lg bg-lu-purple-50 px-3 py-2.5 text-sm text-lu-purple-900">{result}</p>
      )}
    </div>
  );
}

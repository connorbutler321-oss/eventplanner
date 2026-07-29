import { getSessionUser } from "@/lib/auth";
import {
  getPendingChangeRequests,
  getChangeRequests,
  getChangeRequestsForUser,
} from "@/lib/data/requests";
import { getUsers } from "@/lib/data/users";
import { approveRequestAction, declineRequestAction } from "@/lib/actions/requests";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ChangeRequest, ChangeRequestStatus, ChangeRequestType } from "@/lib/types";

const TYPE_LABEL: Record<ChangeRequestType, string> = {
  "event.create": "New event",
  "event.update": "Event edit",
  "event.status": "Status change",
  "floorplan.update": "Floor plan edit",
};

const STATUS_TONE: Record<ChangeRequestStatus, "gold" | "success" | "danger"> = {
  pending: "gold",
  approved: "success",
  declined: "danger",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function requestDetails(req: ChangeRequest): string | null {
  if (req.type === "event.create" || req.type === "event.update") {
    const f = (req.payload as any).fields;
    if (f) return `${new Date(f.date).toLocaleString()} • ${f.location} • capacity ${f.capacity}`;
  }
  return null;
}

function RequestMeta({ req, requester }: { req: ChangeRequest; requester: string }) {
  const details = requestDetails(req);
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="purple">{TYPE_LABEL[req.type]}</Badge>
        <span className="font-semibold text-heading">{req.summary}</span>
      </div>
      {details && <p className="mt-1 text-xs text-muted-foreground">{details}</p>}
      <p className="mt-1 text-xs text-muted-foreground">
        Requested by {requester} • {new Date(req.createdAt).toLocaleString()}
      </p>
      {req.status === "declined" && req.declineReason && (
        <p className="mt-1 text-xs text-danger">Reason: {req.declineReason}</p>
      )}
    </div>
  );
}

export default async function ApprovalsPage() {
  const user = await getSessionUser();
  const isAdmin = user?.role === "admin";
  const userNames = new Map((await getUsers()).map((u) => [u.id, u.name]));
  const nameOf = (id: string) => userNames.get(id) ?? "Unknown user";

  if (isAdmin) {
    const pending = await getPendingChangeRequests();
    const decided = (await getChangeRequests()).filter((r) => r.status !== "pending").slice(0, 25);

    return (
      <div className="ef-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-heading">Approvals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Event and floor-plan changes from request-mode planners. Approving applies the change; declining
            discards it.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending ({pending.length})</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {pending.length === 0 && (
              <p className="text-sm text-muted-foreground">No requests waiting for review.</p>
            )}
            {pending.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border p-3"
              >
                <RequestMeta req={req} requester={nameOf(req.requestedBy)} />
                <div className="flex items-center gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await approveRequestAction(req.id);
                    }}
                  >
                    <Button type="submit" size="sm">
                      Approve
                    </Button>
                  </form>
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await declineRequestAction(req.id, String(formData.get("reason") ?? ""));
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <input
                      name="reason"
                      placeholder="Reason (optional)"
                      className="w-32 rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground"
                    />
                    <Button type="submit" variant="danger" size="sm">
                      Decline
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {decided.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recently decided</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {decided.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <RequestMeta req={req} requester={nameOf(req.requestedBy)} />
                  <div className="text-right">
                    <Badge tone={STATUS_TONE[req.status]}>{req.status}</Badge>
                    {req.decidedBy && (
                      <p className="mt-1 text-xs text-muted-foreground">by {nameOf(req.decidedBy)}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        )}
      </div>
    );
  }

  // Non-admin (request-mode planners): read-only view of their own requests.
  const mine = user ? await getChangeRequestsForUser(user.id) : [];
  return (
    <div className="ef-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">My Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Changes you&apos;ve submitted for admin approval, and their status.
        </p>
      </div>
      <Card>
        <CardBody className="space-y-3">
          {mine.length === 0 && (
            <p className="text-sm text-muted-foreground">
              You haven&apos;t submitted any changes for approval yet.
            </p>
          )}
          {mine.map((req) => (
            <div
              key={req.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border p-3"
            >
              <RequestMeta req={req} requester={nameOf(req.requestedBy)} />
              <Badge tone={STATUS_TONE[req.status]}>{req.status}</Badge>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

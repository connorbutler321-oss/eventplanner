import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  countPendingChangeRequests,
  countPendingChangeRequestsForUser,
} from "@/lib/data/requests";
import { PlannerShell } from "@/components/layout/PlannerShell";

export default async function PlannerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "vendor") redirect("/vendor");

  // Admins see the count of all pending requests; request-mode planners see how
  // many of their own are still in flight.
  let approvalsBadge = 0;
  if (user.role === "admin") {
    approvalsBadge = await countPendingChangeRequests();
  } else if (user.role === "planner") {
    approvalsBadge = await countPendingChangeRequestsForUser(user.id);
  }

  return (
    <PlannerShell user={user} approvalsBadge={approvalsBadge}>
      {children}
    </PlannerShell>
  );
}

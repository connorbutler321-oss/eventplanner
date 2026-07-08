import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { PlannerShell } from "@/components/layout/PlannerShell";

export default async function PlannerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "vendor") redirect("/vendor");

  return <PlannerShell user={user}>{children}</PlannerShell>;
}

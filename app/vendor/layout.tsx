import { redirect } from "next/navigation";
import { getSessionUser, isPreviewingVendor } from "@/lib/auth";
import { getAttendeeById } from "@/lib/data/attendees";
import { VendorShell } from "@/components/layout/VendorShell";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const previewing = await isPreviewingVendor();
  if (user.role !== "vendor" && !previewing) redirect("/planner");

  const attendee = user.attendeeId ? getAttendeeById(user.attendeeId) : undefined;

  return (
    <VendorShell user={user} businessName={attendee?.businessName} isStaffPreview={previewing && user.role !== "vendor"}>
      {children}
    </VendorShell>
  );
}

import { getUsers } from "@/lib/data/users";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { UserForm } from "@/components/planner/UserForm";
import { UsersTable } from "@/components/planner/UsersTable";

export default async function PlannerUsersPage() {
  const currentUser = await getSessionUser();
  if (!currentUser) redirect("/login");
  if (currentUser.role !== "admin") redirect("/planner");

  const users = getUsers();
  const staffUsers = users.filter((u) => u.role !== "vendor");
  const vendorUsers = users.filter((u) => u.role === "vendor");

  return (
    <div className="ef-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Users &amp; Access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage staff access levels and PINs. Only admins can see this page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a staff user</CardTitle>
        </CardHeader>
        <CardBody>
          <UserForm />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staff &amp; admin accounts</CardTitle>
        </CardHeader>
        <UsersTable users={staffUsers} currentUserId={currentUser.id} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendor accounts</CardTitle>
        </CardHeader>
        <UsersTable users={vendorUsers} currentUserId={currentUser.id} />
      </Card>
    </div>
  );
}

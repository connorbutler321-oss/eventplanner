import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { homePathForRole } from "@/lib/auth";

export default async function Home() {
  const user = await getSessionUser();
  redirect(user ? homePathForRole(user.role) : "/login");
}

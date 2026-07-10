import { redirect } from "next/navigation";
import { getDeviceUser } from "@/lib/auth";
import { switchAccountAction } from "@/lib/actions/auth";
import { PinForm } from "@/components/auth/PinForm";
import { Card, CardBody } from "@/components/ui/Card";

export default async function PinPage() {
  const device = await getDeviceUser();
  if (!device) redirect("/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-lu-purple-900 via-lu-purple-700 to-lu-purple-600 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-lu-gold-400 text-xl font-bold text-lu-purple-900 shadow-lg">
            {device.name
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </div>
          <h1 className="text-xl font-bold text-white">Welcome back, {device.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-lu-purple-100">Enter your PIN to continue</p>
        </div>

        <Card>
          <CardBody className="p-6">
            <PinForm />
          </CardBody>
        </Card>

        <form action={switchAccountAction} className="mt-4 text-center">
          <button type="submit" className="cursor-pointer text-sm text-lu-purple-100 underline hover:text-white">
            Not you? Sign in as someone else
          </button>
        </form>
      </div>
    </div>
  );
}

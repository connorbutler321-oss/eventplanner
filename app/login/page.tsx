import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardBody } from "@/components/ui/Card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-lu-purple-900 via-lu-purple-700 to-lu-purple-600 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lu-gold-400 text-2xl font-bold text-lu-purple-900 shadow-lg">
            EF
          </div>
          <h1 className="text-2xl font-bold text-white">EventFlow AI</h1>
          <p className="mt-1 text-sm text-lu-purple-100">Lipscomb Event Planning &amp; Registration</p>
        </div>

        <Card className="ef-fade-in">
          <CardBody className="p-6">
            <h2 className="mb-5 text-lg font-semibold text-lu-purple-900">Sign in</h2>
            <LoginForm />
          </CardBody>
        </Card>

        <Card className="mt-4 border-lu-gold-400/40 bg-lu-purple-50/90">
          <CardBody className="p-4 text-xs text-lu-purple-800">
            <p className="mb-2 font-semibold">Demo accounts (password: password123)</p>
            <ul className="space-y-1">
              <li>admin@lipscomb.edu — Admin</li>
              <li>planner@lipscomb.edu — Event Planner</li>
              <li>staff@lipscomb.edu — Staff</li>
              <li>vendor@lipscomb.edu — Vendor (Lee&apos;s BBQ Co.)</li>
            </ul>
            <p className="mt-2 text-lu-purple-500">
              After your first sign-in, this device will offer a quick PIN unlock instead.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

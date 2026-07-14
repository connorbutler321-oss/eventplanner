import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardBody } from "@/components/ui/Card";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-lu-purple-950 via-lu-purple-800 to-lu-purple-600 px-4 py-10">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-lu-purple-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-lu-gold-500/15 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-lu-gold-400 to-lu-gold-500 text-2xl font-bold text-lu-purple-900 shadow-lg ring-1 ring-white/20">
            EF
          </div>
          <h1 className="text-2xl font-bold text-white">EventFlow AI</h1>
          <p className="mt-1 text-sm text-lu-purple-100">Lipscomb Event Planning &amp; Registration</p>
        </div>

        <Card className="ef-fade-in shadow-xl">
          <CardBody className="p-6 md:p-7">
            <h2 className="mb-5 text-lg font-semibold text-heading">Sign in</h2>
            <LoginForm />
          </CardBody>
        </Card>

        <Card className="mt-4 bg-surface-muted">
          <CardBody className="p-4 text-xs text-foreground">
            <p className="mb-2 font-semibold text-heading">Demo accounts (password: password123)</p>
            <ul className="space-y-1">
              <li>admin@lipscomb.edu — Admin</li>
              <li>planner@lipscomb.edu — Event Planner</li>
              <li>staff@lipscomb.edu — Staff</li>
              <li>vendor@lipscomb.edu — Vendor (Lee&apos;s BBQ Co.)</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              After your first sign-in, this device will offer a quick PIN unlock instead.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

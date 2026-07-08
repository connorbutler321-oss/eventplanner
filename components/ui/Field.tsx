import { cn } from "@/lib/cn";

const controlClasses =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-lu-purple-500 focus:ring-2 focus:ring-lu-purple-100";

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: React.ReactNode;
  htmlFor: string;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-lu-purple-900">
      {children}
      {hint && <span className="ml-1.5 font-normal text-gray-400">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...rest }: React.ComponentProps<"input">) {
  return <input className={cn(controlClasses, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(controlClasses, "min-h-24 resize-y", className)} {...rest} />;
}

export function Select({
  className,
  children,
  ...rest
}: React.ComponentProps<"select">) {
  return (
    <select className={cn(controlClasses, "cursor-pointer bg-white pr-8", className)} {...rest}>
      {children}
    </select>
  );
}

export function FieldGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

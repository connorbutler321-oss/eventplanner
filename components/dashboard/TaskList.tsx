import type { TaskItem } from "@/lib/types";
import { toggleTaskAction } from "@/lib/actions/tasks";
import { IconCheck } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export function TaskList({ tasks }: { tasks: TaskItem[] }) {
  return (
    <ul className="divide-y divide-border">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <form
            action={async () => {
              "use server";
              await toggleTaskAction(task.id);
            }}
          >
            <button
              type="submit"
              aria-label={task.done ? "Mark as not done" : "Mark as done"}
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-colors",
                task.done
                  ? "border-success bg-success text-white"
                  : "border-border-strong text-transparent hover:border-lu-purple-400 hover:bg-lu-purple-400/10"
              )}
            >
              <IconCheck size={12} />
            </button>
          </form>
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-medium",
                task.done ? "text-muted-foreground line-through" : "text-heading"
              )}
            >
              {task.title}
            </p>
            <p className="text-xs text-muted-foreground">{task.detail}</p>
          </div>
        </li>
      ))}
      {tasks.length === 0 && (
        <li className="py-3 text-sm text-muted-foreground">No tasks right now.</li>
      )}
    </ul>
  );
}

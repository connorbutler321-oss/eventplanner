import type { TaskItem } from "@/lib/types";
import { toggleTaskAction } from "@/lib/actions/tasks";
import { TaskToggle } from "@/components/dashboard/TaskToggle";
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
            <TaskToggle done={task.done} />
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

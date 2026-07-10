import type { TaskItem } from "@/lib/types";
import { toggleTaskAction } from "@/lib/actions/tasks";
import { cn } from "@/lib/cn";

export function TaskList({ tasks }: { tasks: TaskItem[] }) {
  return (
    <ul className="divide-y divide-border">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-start gap-3 py-3">
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
                "mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors",
                task.done
                  ? "border-success bg-success text-white"
                  : "border-gray-300 text-transparent hover:border-lu-purple-400"
              )}
            >
              ✓
            </button>
          </form>
          <div>
            <p className={cn("text-sm font-medium", task.done ? "text-gray-400 line-through" : "text-lu-purple-900")}>
              {task.title}
            </p>
            <p className="text-xs text-gray-500">{task.detail}</p>
          </div>
        </li>
      ))}
      {tasks.length === 0 && <li className="py-3 text-sm text-gray-500">No tasks right now.</li>}
    </ul>
  );
}

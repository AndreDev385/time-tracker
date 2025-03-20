import { Check, Loader2, X } from "lucide-react";
import { Button } from "../shared/button";
import { PauseIcon } from "@heroicons/react/24/solid";
import { LocalStorage } from "../../storage";

export function ActiveTask({
  task,
  loading,
  setComment,
  handlePauseTask,
}: Props) {

  const info = LocalStorage().getItem("createTaskInfo")

  const summary = [
    task.recordId,
    info?.workTypes.find(wt => wt.id === task.workTypeId)?.name,
    info?.taskTypes.find(wt => wt.id === task.taskTypeId)?.name,
    info?.recordTypes.find(wt => wt.id === task.recordTypeId)?.name,
  ].filter(v => v)

  return (
    <div className="flex justify-between gap-4 items-center w-full">
      <div className="flex items-center w-full">
        {summary.map(o => (
          <p key={o} className="text-sm border-r border-gray-500 px-1 last:border-none">{o}</p>
        ))}
      </div>
      <div className="flex gap-1 items-center">
        <Button
          variant="ghost"
          size="icon"
          disabled={loading}
          className="size-7  hover:bg-green-500/10"
          onMouseDown={() => setComment({
            show: true,
            action: "solved",
            value: "",
          })}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Check className="size-5 text-green-500" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7  hover:bg-red-500/10"
          disabled={loading}
          onMouseDown={() => setComment({
            show: true,
            action: "canceled",
            value: "",
          })}
        >
          {loading ? <Loader2 className="animate-spin" /> : <X className="size-5 text-red-500" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 hover:bg-primary/10"
          disabled={loading}
          onMouseDown={() => handlePauseTask(task.id)}
        >
          {loading ? <Loader2 className="animate-spin" /> : <PauseIcon className="size-5" />}
        </Button>
      </div>
    </div>
  )
}

type Props = {
  task: Task,
  loading: boolean,
  setComment: (comment: { action: "solved" | "canceled", show: boolean, value: string }) => void
  handlePauseTask: (taskId: Task['id'], otherTask?: boolean) => void
}

import { Loader2 } from "lucide-react";
import { Button } from "../shared/button";
import { CheckCircleIcon, PauseIcon, StopIcon } from "@heroicons/react/24/solid";

export function ActiveTask({
  task,
  loading,
  setComment,
  handlePauseTask,
}: Props) {
  return (
    <div className="flex justify-between p-4 border border-gray-300 rounded-lg shadow-lg items-center">
      <div>
        <h1>Expediente: {task.recordId}</h1>
      </div>
      <div className="flex gap-2">
        <Button
          variant="default"
          size="icon"
          disabled={loading}
          className="rounded-lg bg-green-500 hover:bg-green-400/90"
          onMouseDown={() => setComment({
            show: true,
            action: "solved",
            value: "",
          })}
        >
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircleIcon className="size-6" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-lg border-gray-400"
          disabled={loading}
          onMouseDown={() => handlePauseTask(task.id)}
        >
          {loading ? <Loader2 className="animate-spin" /> : <PauseIcon className="size-6" />}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="rounded-lg"
          disabled={loading}
          onMouseDown={() => setComment({
            show: true,
            action: "canceled",
            value: "",
          })}
        >
          {loading ? <Loader2 className="animate-spin" /> : <StopIcon className="size-6" />}
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

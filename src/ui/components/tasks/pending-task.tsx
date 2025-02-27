import { PlayIcon } from "@heroicons/react/24/solid"
import { Button } from "../shared/button"
import { Loader2 } from "lucide-react"

export function PendingTask({
  task,
  loading,
  handleResumeTask,
}: Props) {
  return (
    <div className="w-full flex justify-between py-2 px-4 border-b border-gray-300 items-center">
      <div>
        <h1>Expediente: {task.recordId}</h1>
      </div>
      <Button
        variant="default"
        size="icon"
        className="rounded-lg bg-green-500 hover:bg-green-400/90"
        onMouseDown={() => handleResumeTask(task.id)}
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" /> : <PlayIcon className="size-6" />}
      </Button>
    </div>
  )
}

type Props = {
  task: Task,
  loading: boolean,
  handleResumeTask: (taskId: Task['id']) => void
}

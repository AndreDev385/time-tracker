import { CheckCircleIcon, Loader2 } from "lucide-react"
import { Button } from "../shared/button"

export function ActiveOtherTask({
  otherTask,
  loading,
  handleCompleteTask,
}: Props) {
  return (
    <div className="flex justify-between gap-4 items-center">
      <div>
        <h1>{otherTask.comment}</h1>
      </div>
      <div className="flex gap-2">
        <Button
          variant="default"
          size="icon"
          disabled={loading}
          className="rounded-lg bg-green-500 hover:bg-green-400/90"
          onMouseDown={() => handleCompleteTask(otherTask.id)}
        >
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircleIcon className="size-6" />}
        </Button>
      </div>
    </div>
  )
}

type Props = {
  otherTask: OtherTask,
  loading: boolean,
  handleCompleteTask: (taskId: Task['id']) => void
}

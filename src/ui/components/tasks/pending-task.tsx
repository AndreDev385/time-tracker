import { PlayIcon } from "@heroicons/react/24/solid"
import { Button } from "../shared/button"
import { Loader2 } from "lucide-react"
import { LocalStorage } from "../../storage"

export function PendingTask({
  task,
  loading,
  handleResumeTask,
}: Props) {

  const info = LocalStorage().getItem("createTaskInfo")
  const summary = [
    task.recordId,
    info?.workTypes.find(wt => wt.id === task.workTypeId)?.name,
    info?.taskTypes.find(wt => wt.id === task.taskTypeId)?.name,
    info?.recordTypes.find(wt => wt.id === task.recordTypeId)?.name,
    info?.business.find(wt => wt.id === task.businessId)?.name,
    info?.projects.find(wt => wt.id === task.projectId)?.name
  ]

  return (
    <div className="w-full flex justify-between py-2 px-4 border-b border-gray-300 items-center">
      <div className="flex items-center w-full">
        {summary.map(o => (
          <p key={o} className="text-sm border-r border-gray-500 px-1 last:border-none">{o}</p>
        ))}
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

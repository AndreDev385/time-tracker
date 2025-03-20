import { Check, X } from "lucide-react";
import { LocalStorage } from "../../storage";

export function FinishedTask({ task }: Props) {
  const info = LocalStorage().getItem("createTaskInfo")

  const summary = [
    task.recordId,
    info?.workTypes.find(wt => wt.id === task.workTypeId)?.name,
    info?.taskTypes.find(wt => wt.id === task.taskTypeId)?.name,
    info?.recordTypes.find(wt => wt.id === task.recordTypeId)?.name,
    info?.business.find(wt => wt.id === task.businessId)?.name,
    info?.projects.find(wt => wt.id === task.projectId)?.name
  ].filter(v => v)

  return (
    <div className="flex justify-between p-4 border border-gray-300 rounded-lg">
      <div className="flex items-center overflow-x-hidden">
        {summary.map(o => (
          <p key={o} className="text-sm border-r border-gray-500 px-1 last:border-none">{o}</p>
        ))}
      </div>
      <div>
        {
          task.status === "solved" ? (
            <Check className="text-green-500" />
          ) : (
            <X className="text-red-500" />
          )
        }
      </div>
    </div>
  )
}

type Props = {
  task: Task;
}

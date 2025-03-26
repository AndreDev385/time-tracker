import { DATE_FORMATS, formatDate, taskDuration } from "../../lib/utils";
import { LocalStorage } from "../../storage";

export function FinishedTask({ task, displayFullDate = false }: Props) {
  const info = LocalStorage().getItem("createTaskInfo")

  const summary = [
    task.recordId,
    info?.workTypes.find(wt => wt.id === task.workTypeId)?.name,
    info?.taskTypes.find(wt => wt.id === task.taskTypeId)?.name,
    info?.recordTypes.find(wt => wt.id === task.recordTypeId)?.name,
    info?.business.find(wt => wt.id === task.businessId)?.name,
    info?.projects.find(wt => wt.id === task.projectId)?.name
  ].filter(v => v)


  const format = displayFullDate ? DATE_FORMATS.ddMMyyyyhhmm : DATE_FORMATS.hhmm
  const textStyle = `${task.status == "solved" ? "text-green-600 border-green-600" : "text-red-600 border-red-600"} text-xs border-r  px-1 last:border-none`
  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <div className="flex flex-wrap items-start justify-between">
        <div className="flex">
          {summary.map(o => (
            <p
              key={o}
              className={textStyle}
            >
              {o}
            </p>
          ))}
        </div>
        <div className="flex">
          {task.intervals.map(interval => (
            <p
              key={interval.startAt.getTime()}
              className={textStyle}
            >
              {formatDate(interval.startAt, format)} - {formatDate(interval.endAt!, format)}
            </p>
          ))}
          <p className={textStyle}>{taskDuration(task.intervals)}</p>
          {
            task.comment ? (
              <p className={textStyle}>{task.comment}</p>
            ) : null
          }
        </div>
      </div>
    </div>
  )
}

type Props = {
  task: Task;
  displayFullDate?: boolean;
}

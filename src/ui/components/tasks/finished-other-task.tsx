import { formatDate } from "date-fns";
import { DATE_FORMATS, taskDuration } from "../../lib/utils";

export function FinishedOtherTask({ task, displayFullDate }: Props) {

  const format = displayFullDate ? DATE_FORMATS.ddMMyyyyhhmm : DATE_FORMATS.hhmm
  const textStyle = `${task.status == "solved" ? "text-green-600 border-green-600" : "text-red-600 border-red-600"} text-xs border-r  px-1 last:border-none`
  return (
    <div className="p-4 border border-gray-300 rounded-lg">
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
      </div>
    </div>
  )
}

type Props = {
  task: OtherTask;
  displayFullDate: boolean
}

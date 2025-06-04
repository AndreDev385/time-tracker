import { formatDate } from "date-fns";
import {
	DATE_FORMATS,
	distanceInMilliseconds,
	millisecondsToHHMM,
} from "../../lib/utils";

export function FinishedOtherTask({ task, displayFullDate }: Props) {
	const format = displayFullDate
		? DATE_FORMATS.ddMMyyyyhhmm
		: DATE_FORMATS.hhmm;
	const textStyle = `${task.status === "solved" ? "text-green-600 border-green-600" : "text-red-600 border-red-600"} text-xs border-r  px-1 last:border-none`;
	return (
		<div className="p-4 border border-gray-300 rounded-lg">
			<div className="flex">
				<p className={textStyle}>
					{formatDate(task.startAt, format)} -{" "}
					{formatDate(task.endAt as Date, format)}
				</p>
				<p className={textStyle}>
					{millisecondsToHHMM(
						distanceInMilliseconds({
							startAt: task.startAt,
							endAt: task.endAt as Date,
						}),
					)}
				</p>
			</div>
		</div>
	);
}

type Props = {
	task: OtherTask;
	displayFullDate: boolean;
};

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { differenceInMilliseconds } from "date-fns";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDistanceHHMM(startDate: Date, endDate: Date): string {
	const diff = Math.abs(differenceInMilliseconds(endDate, startDate));
	return millisecondsToHHMM(diff);
}

export function displayMessage(
	message: string,
	type: "success" | "error" = "success",
) {
	return toast(type === "success" ? "Éxito!" : "Ha ocurrido un error!", {
		description: message,
		richColors: true,
		classNames: {
			title: `text-lg font-bold ${type === "success" ? "text-green-500" : "text-red-500"}`,
			description: "italic text-sm",
		},
		descriptionClassName: "italic text-sm",
	});
}

export const DATE_FORMATS = {
	ddMMyyyy: "dd/MM/yyyy",
	ddMMyyyyhhmm: "dd/MM/yyyy hh:mm",
	hhmm: "hh:mm",
	ddMMyyyyhmma: "dd/MM/yyyy h:mm a",
	hmma: "h:mm a",
};

export function formatDate(
	date: Date,
	typeOfFormat: (typeof DATE_FORMATS)[keyof typeof DATE_FORMATS],
) {
	return format(date, typeOfFormat, {
		locale: es,
	});
}

/**
 * Calculate task duration and formats the result into HH:MM
 *
 * @return HH:mm format of task total duration
 */
export function taskDuration(intervals: Interval[]): string {
	const duration = intervals.reduce(
		(acc, curr) => acc + intervalDistanceInMilliseconds(curr),
		0,
	);
	return millisecondsToHHMM(duration);
}

export function distanceInMilliseconds(value: {
	startAt: Date;
	endAt: Date;
}): number {
	return differenceInMilliseconds(value.endAt, value.startAt);
}

function intervalDistanceInMilliseconds(interval: Interval) {
	if (!interval.endAt) {
		return 0;
	}
	return distanceInMilliseconds({
		startAt: interval.startAt,
		endAt: interval.endAt,
	});
}

export function millisecondsToHHMM(value: number): string {
	const totalSeconds = Math.floor(value / 1000);

	const hours = Math.floor(totalSeconds / 3600);
	const remainingSeconds = totalSeconds % 3600;
	const minutes = Math.floor(remainingSeconds / 60);

	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${pad(hours)}h:${pad(minutes)}m`;
}

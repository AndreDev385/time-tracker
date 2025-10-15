import { endOfYear, startOfToday } from "date-fns";
import { getJourneys } from "./get-journeys.js";
import { Operator } from "../utils.js";

export async function getTodaysJourneys() {
	const filters: FiltersPrimitives[] = [
		{ field: "startAt", operator: Operator.GT, value: startOfToday().toISOString() },
		{ field: "endAt", operator: Operator.LT, value: endOfYear(new Date()).toISOString() },
	];
	return getJourneys(filters);
}

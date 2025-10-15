import { net } from "electron";
import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";
import { mapIntervalsStringToDate } from "../../lib/map-intervals.js";
import logger from '../../lib/logger.js';

export async function getMyTasks(
	statuses: TaskStatus[],
	endAt?: Date,
): Promise<({ tasks: Task[] } & SuccessResponse) | ErrorResponse> {
	logger.info("get-my-tasks: entry");
	try {
		const token = readToken()?.token ?? "";

		const url = new URL(`${API_URL}/tasks`);
		for (const s of statuses) {
			url.searchParams.append("status", s);
		}

		if (endAt) {
			url.searchParams.set("endAt", endAt.toDateString());
		}

		const response = await net.fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			logger.error("get-my-tasks: api error", { status: response.status });
			return { success: false, error: "Ha ocurrido un error" };
		}

		const data = await response.json();

		logger.info("get-my-tasks: success", { taskCount: data.length });
		return {
			success: true,
			tasks: data.map(
				(t: { intervals: { startAt: string; endAt: string | null }[] }) => ({
					...t,
					intervals: mapIntervalsStringToDate(t.intervals),
				}),
			),
		};
	} catch (e) {
		logger.error("get-my-tasks: error", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

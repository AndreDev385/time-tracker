import { net } from "electron";
import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";
import { mapIntervalsStringToDate } from "../../lib/map-intervals.js";
import logger from '../../lib/logger.js';

export async function resumeTask(
	taskId: Task["id"],
): Promise<({ task: Task } & SuccessResponse) | ErrorResponse> {
	try {
		const token = readToken()?.token;
		const response = await net.fetch(`${API_URL}/tasks/${taskId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `Bearer ${token}` : "",
			},
			body: JSON.stringify({
				intent: "resume",
			}),
		});

		const json = await response.json();
		if (!response.ok) {
			logger.error("resume-task: error", { taskId, json });
			return { success: false, error: "Ha ocurrido un error" };
		}
		logger.info("resume-task: success", { taskId });

		return {
			success: response.ok,
			task: {
				...json.task,
				intervals: mapIntervalsStringToDate(json.task.intervals),
			},
		};
	} catch (e) {
		logger.error("resume-task-interval", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

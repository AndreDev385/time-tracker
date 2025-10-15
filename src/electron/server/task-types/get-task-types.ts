import { net } from "electron";
import { API_URL } from "../config.js";
import logger from '../../lib/logger.js';

export async function getTaskTypes(): Promise<
	({ taskTypes: TaskType[] } & SuccessResponse) | ErrorResponse
> {
	logger.info("get-task-types: entry");
	try {
		const response = await net.fetch(`${API_URL}/task-types`, {
			method: "GET",
		});

		const body = await response.json();
		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" };
		}

		logger.info("get-task-types: success", { taskTypeCount: body.length });
		return { success: true, taskTypes: body };
	} catch (e) {
		logger.error("get-task-types: error", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

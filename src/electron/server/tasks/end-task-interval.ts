import { net } from "electron";
import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";
import logger from '../../lib/logger.js';

type EndTaskIntervalIntent = "complete" | "cancel" | "pause";

async function endTaskInterval(
	intent: EndTaskIntervalIntent,
	isOtherTask: boolean,
	taskId: Task["id"],
	comment: string,
): Promise<SuccessResponse | ErrorResponse> {
	try {
		const URL = isOtherTask
			? `${API_URL}/other-tasks/${taskId}`
			: `${API_URL}/tasks/${taskId}`;
		const token = readToken()?.token;
		const response = await net.fetch(URL, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `Bearer ${token}` : "",
			},
			body: JSON.stringify({
				intent: intent,
				comment,
			}),
		});

		if (!response.ok) {
			logger.error(`end-task-interval: ${intent} error`, { taskId });
			return { success: false, error: "Ha ocurrido un error" };
		}

		logger.info(`end-task-interval: ${intent} success`, { taskId });
		return {
			success: response.ok,
		};
	} catch (e) {
		logger.error(`end-task-interval: ${intent}`, { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

const curriedEnTaskInterval =
	(status: EndTaskIntervalIntent) =>
	(isOtherTask: boolean) =>
	({ id, comment }: { id: Task["id"]; comment: string }) =>
		endTaskInterval(status, isOtherTask, id, comment);

export const completeTask = curriedEnTaskInterval("complete")(false);
export const cancelTask = curriedEnTaskInterval("cancel")(false);
export const pauseTaskInterval = curriedEnTaskInterval("pause")(false);

export const completeOtherTask = curriedEnTaskInterval("complete")(true);

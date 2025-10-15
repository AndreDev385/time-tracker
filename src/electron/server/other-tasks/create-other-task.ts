import { net } from "electron";
import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";
import logger from '../../lib/logger.js';

export async function createOtherTask(
	data: CreateOtherTaskData,
): Promise<({ otherTask: OtherTask } & SuccessResponse) | ErrorResponse> {
	try {
		const token = readToken()?.token;
		const response = await net.fetch(`${API_URL}/other-tasks`, {
			method: "POST",
			body: JSON.stringify(data),
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `Bearer ${token}` : "",
			},
		});

		const json = await response.json();

		if (!response.ok) {
			logger.error("create-other-task: error", { json });
			return { success: false, error: "Ha ocurrido un error" };
		}

		logger.info("create-other-task: success", { otherTaskId: json.data.id });
		return {
			success: response.ok,
			otherTask: {
				...json.data,
			},
		};
	} catch (e) {
		logger.error("create-other-task", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

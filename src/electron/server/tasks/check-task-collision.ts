import { net } from "electron";
import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";
import { me } from "../me.js";
import logger from '../../lib/logger.js';

export async function checkTaskCollision(data: CreateTaskFormData): Promise<
	| ((
			| {
					collision: false;
			  }
			| {
					collision: true;
					data: {
						user: string;
						taskType: string;
						taskStatus: Task["status"];
					};
			  }
	  ) &
			SuccessResponse)
	| ErrorResponse
> {
	logger.info("check-task-collision: entry");
	try {
		const token = readToken()?.token;

		const url = new URL(`${API_URL}/task-collision`);
		url.searchParams.set("task-type-id", String(data.taskTypeId));
		url.searchParams.set("record-id", data.recordId);

		const response = await net.fetch(url.toString(), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `Bearer ${token}` : "",
			},
		});

		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" };
		}

		const result = await response.json();
		if (result.collision) {
			const userResult = await me();
			if (!userResult.success) {
				return { success: false, error: "Ha ocurrido un error" };
			}
			result.data.user = userResult.user.name;
		}
		logger.info("check-task-collision: success", { collision: result.collision });
		return result;
	} catch (e) {
		logger.error("check-task-collision: error", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

import { net } from "electron";
import { API_URL } from "../config.js";

export async function getTaskTypes(): Promise<
	({ taskTypes: TaskType[] } & SuccessResponse) | ErrorResponse
> {
	try {
		const response = await net.fetch(`${API_URL}/task-types`, {
			method: "GET",
		});

		const body = await response.json();
		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" };
		}

		return { success: true, taskTypes: body };
	} catch (e) {
		console.log("get-task-types", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

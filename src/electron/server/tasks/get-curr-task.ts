import { net } from "electron";
import { API_URL } from "../config.js";
import { readToken } from "../../lib/jwt.js";
import logger from '../../lib/logger.js';

export async function getCurrTask(): Promise<
	({ task?: Task | OtherTask } & SuccessResponse) | ErrorResponse
> {
	try {
		const token = readToken()?.token ?? "";
		const response = await net.fetch(`${API_URL}/curr-task`, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${token}`,
			},
		});

		const data = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: data.error,
			};
		}

		return {
			success: true,
			task: data.task,
		};
	} catch (e) {
		logger.error("get-curr-task", { e });
		return { success: false, error: "Ha ocurrido un error al buscar la tarea" };
	}
}

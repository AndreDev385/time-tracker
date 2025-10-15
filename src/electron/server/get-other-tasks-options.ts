import { net } from "electron";
import { API_URL } from "./config.js";
import logger from '../lib/logger.js';

export async function getOtherTaskOptions(): Promise<
	| ({ options: { id: string; value: string }[] } & SuccessResponse)
	| ErrorResponse
> {
	logger.info("get-other-task-options: entry");
	try {
		const response = await net.fetch(`${API_URL}/other-task-options`, {
			method: "GET",
		});

		const json = await response.json();

		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" };
		}

		logger.info("get-other-task-options: success", { optionCount: json.length });
		return {
			success: true,
			options: json,
		};
	} catch (e) {
		logger.error("get-other-task-options: error", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

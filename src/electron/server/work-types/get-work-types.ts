import { net } from "electron";
import { API_URL } from "../config.js";
import logger from '../../lib/logger.js';

export async function getWorkTypes(): Promise<
	({ workTypes: WorkType[] } & SuccessResponse) | ErrorResponse
> {
	logger.info("get-work-types: entry");
	try {
		const response = await net.fetch(`${API_URL}/work-types`, {
			method: "GET",
		});

		const body = await response.json();
		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" };
		}

		logger.info("get-work-types: success", { workTypeCount: body.length });
		return { success: true, workTypes: body };
	} catch (e) {
		logger.error("get-work-types: error", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

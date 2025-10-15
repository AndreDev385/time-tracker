import { net } from "electron";
import { API_URL } from "../config.js";
import logger from '../../lib/logger.js';

export async function getProjects(): Promise<
	({ projects: Project[] } & SuccessResponse) | ErrorResponse
> {
	logger.info("get-projects: entry");
	try {
		const response = await net.fetch(`${API_URL}/projects`, {
			method: "GET",
		});

		const body = await response.json();
		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" };
		}

		logger.info("get-projects: success", { projectCount: body.length });
		return { success: true, projects: body };
	} catch (e) {
		logger.error("get-projects: error", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

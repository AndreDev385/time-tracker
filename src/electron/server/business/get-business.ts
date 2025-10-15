import { net } from "electron";
import { API_URL } from "../config.js";
import logger from '../../lib/logger.js';

export async function getBusiness(): Promise<
	(SuccessResponse & { businesses: Business[] }) | ErrorResponse
> {
	logger.info("get-business: entry");
	try {
		const response = await net.fetch(`${API_URL}/business`, {
			method: "GET",
		});
		const body = await response.json();
		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" };
		}
		logger.info("get-business: success", { businessCount: body.length });
		return { success: true, businesses: body };
	} catch (e) {
		logger.error("get-business: error", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

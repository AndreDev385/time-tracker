import { net } from "electron";
import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";
import logger from '../../lib/logger.js';

export async function endJourney(
	journeyId: string,
): Promise<({ journey: Journey } & SuccessResponse) | ErrorResponse> {
	logger.info("end-journey: entry");
	try {
		const token = readToken()?.token;
		const response = await net.fetch(`${API_URL}/journeys`, {
			method: "PUT",
			body: JSON.stringify({ journeyId }),
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `Bearer ${token}` : "",
			},
		});

		const json = await response.json();
		logger[response.ok ? 'info' : 'error'](`end-journey: ${response.ok ? 'success' : 'error'}`, response.ok ? { journeyId } : { journeyId, json });
		return { success: response.ok, ...json };
	} catch (e) {
		logger.error("end-journey: error", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

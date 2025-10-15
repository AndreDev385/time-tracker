import { net } from "electron";
import { v4 } from "uuid";

import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";
import logger from '../../lib/logger.js';

export async function startJourney(): Promise<
	({ journey: Journey } & SuccessResponse) | ErrorResponse
> {
	logger.info("start-journey: entry");
	try {
		const token = readToken()?.token;
		const response = await net.fetch(`${API_URL}/journeys`, {
			method: "POST",
			body: JSON.stringify({
				id: v4().toString(),
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `Bearer ${token}` : "",
			},
		});

		const json = await response.json();
		logger[response.ok ? 'info' : 'error'](`start-journey: ${response.ok ? 'success' : 'error'}`, response.ok ? { journeyId: json.journey.id } : { json });
		return { success: response.ok, ...json };
	} catch (e) {
		logger.error("start-journey: error", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

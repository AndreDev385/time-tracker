import { net } from "electron";
import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";
import logger from '../../lib/logger.js';

export async function getActualJourney(): Promise<
	({ journey: Journey } & SuccessResponse) | ErrorResponse
> {
	try {
		const token = readToken()?.token;
		const response = await net.fetch(`${API_URL}/journeys`, {
			method: "GET",
			headers: {
				Authorization: token ? `Bearer ${token}` : "",
			},
		});

		const json = await response.json();

		if (!response.ok) {
			return { success: false, error: json.error };
		}

		return { journey: json.journey, success: true };
	} catch (e) {
		logger.error("get-actual-journey", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

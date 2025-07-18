import { net } from "electron";
import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";

export async function endJourney(
	journeyId: string,
): Promise<({ journey: Journey } & SuccessResponse) | ErrorResponse> {
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
		return { success: response.ok, ...json };
	} catch (e) {
		console.log("end-journey", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

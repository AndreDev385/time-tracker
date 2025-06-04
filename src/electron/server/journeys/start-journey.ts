import { net } from "electron";
import { v4 } from "uuid";

import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";

export async function startJourney(): Promise<
	({ journey: Journey } & SuccessResponse) | ErrorResponse
> {
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
		return { success: response.ok, ...json };
	} catch (e) {
		console.log("start-journey", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

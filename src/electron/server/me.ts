import { net } from "electron";
import { API_URL } from "./config.js";
import { readToken } from "../lib/jwt.js";
import logger from '../lib/logger.js';

export async function me(): Promise<
	({ user: JWTTokenData } & SuccessResponse) | ErrorResponse
> {
	logger.info("me: entry");
	try {
		const token = readToken()?.token;
		const response = await net.fetch(`${API_URL}/users/me`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `Bearer ${token}` : "",
			},
		});

		const json = await response.json();

		if (!response.ok) {
			logger.error("me: error", { error: "Auth failed" });
			return { success: false, error: "Ha ocurrido un error" };
		}

		logger.info("me: success", { userId: json.user.id });
		return { success: true, ...json };
	} catch (e) {
		logger.error("me: error", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

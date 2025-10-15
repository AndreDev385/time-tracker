import { net } from "electron";
import { readToken } from "../lib/jwt.js";
import { API_URL } from "./config.js";
import logger from '../lib/logger.js';

export async function saveUserCaptures(urls: string[]): Promise<void> {
	try {
		logger.info("captures urls", { urls });
		const token = readToken()?.token;
		const response = await net.fetch(`${API_URL}/user-captures`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `Bearer ${token}` : "",
			},
			body: JSON.stringify({ urls }),
		});

		const body = await response.json();
		logger.info("User captures", { body });
	} catch (e) {
		logger.error("save-user-capture", { e });
	}
}

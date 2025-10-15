import { net } from "electron";

import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";
import logger from '../../lib/logger.js';

export async function updateLastHeartBeat(): Promise<void> {
	try {
		const token = readToken()?.token;
		await net.fetch(`${API_URL}/journeys/heartbeat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `Bearer ${token}` : "",
			},
		});
	} catch (e) {
		logger.error("updateLastHeartBeat", e);
	}
}

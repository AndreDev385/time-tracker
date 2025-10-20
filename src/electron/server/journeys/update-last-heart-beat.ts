import { net } from "electron";

import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";
import logger from '../../lib/logger.js';

export async function updateLastHeartBeat(): Promise<void> {
	try {
		const token = readToken()?.token;
		const response = await net.fetch(`${API_URL}/journeys/heartbeat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `Bearer ${token}` : "",
			},
		});

		if (!response.ok) {
			if (response.status === 404) {
				// Journey not found - was ended by server
				logger.info("Heartbeat failed - journey ended by server");
				// Trigger cleanup (this will be handled by the journey sync interval)
				return;
			}
			throw new Error(`Heartbeat failed: ${response.status}`);
		}

		logger.info("Heartbeat updated successfully");
	} catch (e) {
		logger.error("updateLastHeartBeat", e);
	}
}
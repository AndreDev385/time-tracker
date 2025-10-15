import { net } from "electron";
import { API_URL } from "./config.js";
import logger from '../lib/logger.js';

export async function signIn(data: SignInFormData): Promise<SignInResult> {
	logger.info("sign-in: entry");
	try {
		const response = await net.fetch(`${API_URL}/auth/sign-in`, {
			method: "POST",
			body: JSON.stringify(data),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const json = await response.json();
		logger[response.ok ? 'info' : 'error'](`sign-in: ${response.ok ? 'success' : 'error'}`, response.ok ? { userId: json.user?.id } : { json });
		return { success: response.ok, ...json };
	} catch (e) {
		logger.error("sign-in: error", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

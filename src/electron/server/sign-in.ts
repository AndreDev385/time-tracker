import { net } from "electron";
import { API_URL } from "./config.js";

export async function signIn(data: SignInFormData): Promise<SignInResult> {
	try {
		const response = await net.fetch(`${API_URL}/auth/sign-in`, {
			method: "POST",
			body: JSON.stringify(data),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const json = await response.json();
		return { success: response.ok, ...json };
	} catch (e) {
		console.log("sign-in", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

import { net } from "electron"
import { readToken } from "../lib/jwt.js"
import { API_URL } from "./config.js"

export async function saveUserCaptures(urls: string[]): Promise<void> {
	try {
		console.log({ urls }, "captures urls")
		const token = readToken()?.token
		const response = await net.fetch(`${API_URL}/user-captures`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": token ? `Bearer ${token}` : ""
			},
			body: JSON.stringify({ urls })
		})

		const body = await response.json()
		console.log({ body }, "User captures")
	} catch (e) {
		console.log("save-user-capture", { e })
	}
}

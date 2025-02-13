import { net } from "electron"
import { readToken } from "../../lib/jwt.js"
import { API_URL } from "../config.js"

export async function endSession(session_id: number) {
	const token = readToken()?.token

	const response = await net.fetch(`${API_URL}/sessions`, {
		method: "PUT",
		body: JSON.stringify({ session_id }),
		headers: {
			"Content-Type": "application/json",
			Authorization: token ? `Bearer ${token}` : "",
		},
	})

	const json = await response.json()
	console.log({ json })
	return { success: response.ok, ...json }
}

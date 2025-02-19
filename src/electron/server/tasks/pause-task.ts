import { net } from "electron";
import { API_URL } from "../config.js";
import { readToken } from "../../lib/jwt.js";

export async function pauseTask(taskId: Task['id']) {
	const token = readToken()?.token
	const response = await net.fetch(`${API_URL}/tasks/${taskId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"Authorization": token ? `Bearer ${token}` : ""
		},
		body: JSON.stringify({
			intent: "pause",
		}),
	})

	const json = await response.json()
	console.log({ json, ok: response.ok, status: response.status })
	return { success: response.ok, task: json.data }
}

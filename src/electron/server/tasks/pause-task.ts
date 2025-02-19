import { net } from "electron";
import { API_URL } from "../config.js";
import { readToken } from "../../lib/jwt.js";

export async function pauseTask(taskId: Task['id']): Promise<{ task: Task } & SuccessResponse | ErrorResponse> {
	try {
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
		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" }
		}
		return {
			success: response.ok,
			task: {
				...json.data,
				intervals: json.data.intervals.map((i: { startAt: string, endAt: string | null }) => (
					{ startAt: new Date(i.startAt), endAt: i.endAt ? new Date(i.endAt) : null }
				))
			}
		}
	} catch (e) {
		console.log("pause-task", { e })
		return { success: false, error: "Ha ocurrido un error" }
	}
}

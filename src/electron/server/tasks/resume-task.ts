import { net } from "electron"
import { readToken } from "../../lib/jwt.js"
import { API_URL } from "../config.js"
import { mapIntervalsStringToDate } from "../../lib/map-intervals.js"

export async function resumeTask(taskId: Task['id']): Promise<{ task: Task } & SuccessResponse | ErrorResponse> {
	try {
		const token = readToken()?.token
		const response = await net.fetch(`${API_URL}/tasks/${taskId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": token ? `Bearer ${token}` : ""
			},
			body: JSON.stringify({
				intent: "resume",
			}),
		})

		const json = await response.json()
		console.log({ json, ok: response.ok })
		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" }
		}

		return {
			success: response.ok,
			task: {
				...json.task,
				intervals: mapIntervalsStringToDate(json.task.intervals),
			}
		}
	} catch (e) {
		console.log(`resume-task-interval`, { e })
		return { success: false, error: "Ha ocurrido un error" }
	}
}

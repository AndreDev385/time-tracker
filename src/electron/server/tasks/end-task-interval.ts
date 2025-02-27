import { net } from "electron"
import { readToken } from "../../lib/jwt.js"
import { API_URL } from "../config.js"

type EndTaskIntervalIntent = "complete" | "cancel" | "pause"

async function endTaskInterval(
	intent: EndTaskIntervalIntent,
	isOtherTask: boolean,
	taskId: Task['id'],
): Promise<SuccessResponse | ErrorResponse> {
	try {
		const URL = isOtherTask ? `${API_URL}/other-tasks/${taskId}` : `${API_URL}/tasks/${taskId}`
		const token = readToken()?.token
		const response = await net.fetch(URL, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": token ? `Bearer ${token}` : ""
			},
			body: JSON.stringify({
				intent: intent,
			}),
		})

		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" }
		}

		return {
			success: response.ok,
		}
	} catch (e) {
		console.log(`end-task-interval: ${intent}`, { e })
		return { success: false, error: "Ha ocurrido un error" }
	}
}

const curriedEnTaskInterval = (status: EndTaskIntervalIntent) => (isOtherTask: boolean) => (id: Task['id']) => endTaskInterval(status, isOtherTask, id)

export const completeTask = curriedEnTaskInterval("complete")(false)
export const cancelTask = curriedEnTaskInterval("cancel")(false)
export const pauseTaskInterval = curriedEnTaskInterval("pause")(false)

export const completeOtherTask = curriedEnTaskInterval("complete")(true) 

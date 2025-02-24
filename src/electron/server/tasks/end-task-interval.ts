import { net } from "electron"
import { readToken } from "../../lib/jwt.js"
import { API_URL } from "../config.js"

type EndTaskIntervalIntent = "complete" | "cancel" | "pause"


async function endTaskInterval(
	intent: EndTaskIntervalIntent,
	taskId: Task['id'],
): Promise<{ task: Task } & SuccessResponse | ErrorResponse> {
	try {
		const token = readToken()?.token
		const response = await net.fetch(`${API_URL}/tasks/${taskId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": token ? `Bearer ${token}` : ""
			},
			body: JSON.stringify({
				intent: intent,
			}),
		})

		const json = await response.json()
		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" }
		}
		console.log({ json })
		return {
			success: response.ok,
			task: {
				...json.task,
				intervals: json.task.intervals.map((i: { startAt: string, endAt: string | null }) => (
					{ startAt: new Date(i.startAt), endAt: i.endAt ? new Date(i.endAt) : null }
				))
			}
		}
	} catch (e) {
		console.log(`end-task-interval: ${intent}`, { e })
		return { success: false, error: "Ha ocurrido un error" }
	}
}

const curriedEnTaskInterval = (status: EndTaskIntervalIntent) => ((id: Task['id']) => endTaskInterval(status, id))

export const completeTask = curriedEnTaskInterval("complete")
export const cancelTask = curriedEnTaskInterval("cancel")
export const pauseTaskInterval = curriedEnTaskInterval("pause")

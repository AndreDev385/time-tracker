import { net } from "electron"
import { readToken } from "../../lib/jwt.js"
import { API_URL } from "../config.js"
import { mapIntervalsStringToDate } from "../../lib/map-intervals.js"

export async function createOtherTask(data: CreateOtherTaskData): Promise<{ otherTask: OtherTask } & SuccessResponse | ErrorResponse> {
	try {
		const token = readToken()?.token
		const response = await net.fetch(`${API_URL}/other-tasks`, {
			method: "POST",
			body: JSON.stringify(data),
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `Bearer ${token}` : "",
			}
		})

		const json = await response.json()

		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" }
		}

		return {
			success: response.ok,
			otherTask: {
				...json.data,
				intervals: mapIntervalsStringToDate(json.data.intervals)
			}
		}
	} catch (e) {
		console.log("create-other-task", { e })
		return { success: false, error: "Ha ocurrido un error" }
	}
}

import { net } from 'electron'
import { API_URL } from '../config.js'
import { readToken } from '../../lib/jwt.js'
import { mapIntervalsStringToDate } from '../../lib/map-intervals.js'

export async function createTask(data: CreateTaskFormData): Promise<{ task: Task } & SuccessResponse | ErrorResponse> {
	try {
		const token = readToken()?.token
		const response = await net.fetch(`${API_URL}/tasks`, {
			method: "POST",
			body: JSON.stringify(data),
			headers: {
				"Content-Type": "application/json",
				"Authorization": token ? `Bearer ${token}` : ""
			}
		})

		const json = await response.json()

		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" }
		}

		return {
			success: response.ok,
			task: {
				...json.data,
				intervals: mapIntervalsStringToDate(json.data.intervals)
			}
		}
	} catch (e) {
		console.log("create-task", { e })
		return { success: false, error: "Ha ocurrido un error" }
	}
}


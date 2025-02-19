import { net } from "electron"
import { API_URL } from "../config.js"

export async function getTaskTypes(): Promise<TaskType[]> {
	const response = await net.fetch(`${API_URL}/task-types`, {
		method: "GET",
	})

	return await response.json()
}

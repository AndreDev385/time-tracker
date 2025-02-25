import { net } from "electron";
import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";

export async function getMyTasks(): Promise<{ tasks: Task[] } & SuccessResponse | ErrorResponse> {
	try {
		const token = readToken()?.token ?? ''

		const response = await net.fetch(`${API_URL}/tasks/`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" }
		}

		const data = await response.json()
		return {
			success: true,
			tasks: data,
		}

	} catch (e) {
		console.log({ e })
		return { success: false, error: "Ha ocurrido un error" }
	}
}

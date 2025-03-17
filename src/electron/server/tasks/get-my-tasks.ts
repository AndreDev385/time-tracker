import { net } from "electron";
import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";

//TODO: Update to add date range

export async function getMyTasks(statuses: TaskStatus[], startAt?: Date): Promise<{ tasks: Task[] } & SuccessResponse | ErrorResponse> {
	try {
		const token = readToken()?.token ?? ''

		const url = new URL(`${API_URL}/tasks`)
		for (const s of statuses) {
			url.searchParams.append("status", s)
		}

		if (startAt) {
			url.searchParams.set("startAt", startAt.toDateString())
		}

		const response = await net.fetch(url.toString(), {
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

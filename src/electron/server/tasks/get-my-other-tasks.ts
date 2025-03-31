import { net } from "electron";
import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";
import { mapIntervalsStringToDate } from "../../lib/map-intervals.js";

export async function getMyOtherTasks(statuses: TaskStatus[], startAt?: Date): Promise<{ otherTasks: OtherTask[] } & SuccessResponse | ErrorResponse> {
	try {
		const token = readToken()?.token ?? ''

		const url = new URL(`${API_URL}/other-tasks`)
		for (const s of statuses) {
			url.searchParams.set("status", s)
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
			otherTasks: data.map((t: { intervals: { startAt: string, endAt: string | null }[] }) => ({
				...t,
				intervals: mapIntervalsStringToDate(t.intervals)
			})),
		}

	} catch (e) {
		console.log({ e })
		return { success: false, error: "Ha ocurrido un error" }
	}
}

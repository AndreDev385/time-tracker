import { net } from "electron";
import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";
import { mapIntervalsStringToDate } from "../../lib/map-intervals.js";

export async function getTaskHistory(
	offset: number,
	limit = 10,
	recordId?: string,
): Promise<
	({ count: number; rows: Task[] } & SuccessResponse) | ErrorResponse
> {
	try {
		const token = readToken()?.token ?? "";

		const url = new URL(`${API_URL}/tasks-paginate`);
		url.searchParams.set("offset", `${offset}`);
		url.searchParams.set("limit", `${limit}`);

		url.searchParams.append("status", "solved");
		url.searchParams.append("status", "canceled");

		if (recordId) {
			url.searchParams.set("recordId", recordId);
		}

		const response = await net.fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" };
		}

		const data = await response.json();
		return {
			...data,
			rows: data.rows.map(
				(t: { intervals: { startAt: string; endAt: string | null }[] }) => ({
					...t,
					intervals: mapIntervalsStringToDate(t.intervals),
				}),
			),
			success: true,
		};
	} catch (e) {
		console.log("paginate-task-history", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

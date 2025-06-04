import { net } from "electron";
import { API_URL } from "../config.js";

export async function getWorkTypes(): Promise<
	({ workTypes: WorkType[] } & SuccessResponse) | ErrorResponse
> {
	try {
		const response = await net.fetch(`${API_URL}/work-types`, {
			method: "GET",
		});

		const body = await response.json();
		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" };
		}

		return { success: true, workTypes: body };
	} catch (e) {
		console.log("get-work-types", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

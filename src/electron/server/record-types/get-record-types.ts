import { net } from "electron";
import { API_URL } from "../config.js";

export async function getRecordTypes(): Promise<
	({ recordTypes: RecordType[] } & SuccessResponse) | ErrorResponse
> {
	try {
		const response = await net.fetch(`${API_URL}/record-types`, {
			method: "GET",
		});

		const body = await response.json();
		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" };
		}

		return { success: true, recordTypes: body };
	} catch (e) {
		console.log("get-record-types", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

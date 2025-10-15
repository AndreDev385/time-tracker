import { net } from "electron";
import { API_URL } from "../config.js";
import logger from '../../lib/logger.js';

export async function getRecordTypes(): Promise<
	({ recordTypes: RecordType[] } & SuccessResponse) | ErrorResponse
> {
	logger.info("get-record-types: entry");
	try {
		const response = await net.fetch(`${API_URL}/record-types`, {
			method: "GET",
		});

		const body = await response.json();
		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" };
		}

		logger.info("get-record-types: success", { recordTypeCount: body.length });
		return { success: true, recordTypes: body };
	} catch (e) {
		logger.error("get-record-types: error", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

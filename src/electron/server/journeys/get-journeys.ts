import { net } from "electron";
import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";
import logger from '../../lib/logger.js';

export async function getJourneys(filters: FiltersPrimitives[]): Promise<
	({ journeys: Journey[] } & SuccessResponse) | ErrorResponse
> {
	logger.info("get-journeys: entry", { filterCount: filters.length });
	try {
		const token = readToken()?.token;

		const queryParams = new URLSearchParams();
		filters.forEach((filter, index) => {
			queryParams.set(`filters[${index + 1}][field]`, filter.field);
			queryParams.set(`filters[${index + 1}][operator]`, filter.operator);
			queryParams.set(`filters[${index + 1}][value]`, filter.value);
		});

		const response = await net.fetch(`${API_URL}/journey-stats?${queryParams.toString()}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `Bearer ${token}` : "",
			},
		});

		const json = await response.json();

		if (response.ok) {
			logger.info("get-journeys: success", { journeyCount: json.journeys.length });
		} else {
			logger.error("get-journeys: error", { json });
		}

		return { success: response.ok, ...json };
	} catch (e) {
		logger.error("get-journeys: error", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

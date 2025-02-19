import { net } from "electron"
import { API_URL } from "../config.js"

export async function getRecordTypes(): Promise<RecordType[]> {
	const response = await net.fetch(`${API_URL}/record-types`, {
		method: "GET",
	})

	return await response.json()
}

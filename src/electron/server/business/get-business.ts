import { net } from "electron"
import { API_URL } from "../config.js"

export async function getBusiness(): Promise<SuccessResponse & { businesses: Business[] } | ErrorResponse> {
	try {
		const response = await net.fetch(`${API_URL}/business`, {
			method: "GET",
		})
		const body = await response.json()
		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" }
		}
		return { success: true, businesses: body }
	} catch (e) {
		console.log("get-business", { e })
		return { success: false, error: "Ha ocurrido un error" }
	}
}

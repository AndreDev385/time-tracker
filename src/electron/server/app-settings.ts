import { net } from "electron"
import { API_URL } from "./config.js"

export async function getAppSettings(): Promise<{ settings: AppSetting[] } & SuccessResponse | ErrorResponse> {
	try {
		const response = await net.fetch(`${API_URL}/app-settings`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			}
		})

		const json = await response.json()

		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" }
		}

		return { success: true, settings: json }
	} catch (e) {
		console.log("get-app-settings", { e })
		return { success: false, error: "Ha ocurrido un error" }
	}
}



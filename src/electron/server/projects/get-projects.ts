import { net } from "electron";
import { API_URL } from "../config.js";

export async function getProjects(): Promise<{ projects: Project[] } & SuccessResponse | ErrorResponse> {
	try {
		const response = await net.fetch(`${API_URL}/projects`, {
			method: "GET",
		})

		const body = await response.json()
		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" }
		}

		return { success: true, projects: body }
	} catch (e) {
		console.log("get-projects", { e })
		return { success: false, error: "Ha ocurrido un error" }
	}
}

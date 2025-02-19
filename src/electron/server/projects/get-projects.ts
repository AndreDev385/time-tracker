import { net } from "electron";
import { API_URL } from "../config.js";

export async function getProjects(): Promise<Project[]> {
	const response = await net.fetch(`${API_URL}/projects`, {
		method: "GET",
	})

	return await response.json()
}

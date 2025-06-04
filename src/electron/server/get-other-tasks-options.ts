import { net } from "electron";
import { API_URL } from "./config.js";

export async function getOtherTaskOptions(): Promise<
	| ({ options: { id: string; value: string }[] } & SuccessResponse)
	| ErrorResponse
> {
	try {
		const response = await net.fetch(`${API_URL}/other-task-options`, {
			method: "GET",
		});

		const json = await response.json();

		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" };
		}

		return {
			success: true,
			options: json,
		};
	} catch (e) {
		console.log("get-other-task-options", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

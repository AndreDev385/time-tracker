import { net } from "electron";
import { readToken } from "../../lib/jwt.js";
import { API_URL } from "../config.js";

export async function checkTaskCollision(data: CreateTaskFormData): Promise<
	| ((
			| {
					collision: false;
			  }
			| {
					collision: true;
					data: {
						taskType: string;
						taskStatus: Task["status"];
						user: string;
					};
			  }
	  ) &
			SuccessResponse)
	| ErrorResponse
> {
	try {
		const token = readToken()?.token;

		const url = new URL(`${API_URL}/task-collision`);
		url.searchParams.set("task-type-id", String(data.taskTypeId));
		url.searchParams.set("record-id", data.recordId);

		const response = await net.fetch(url.toString(), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `Bearer ${token}` : "",
			},
		});

		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" };
		}

		return await response.json();
	} catch (e) {
		console.log("check-collision", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

import { getBusiness } from "../business/get-business.js";
import { getProjects } from "../projects/get-projects.js";
import { getRecordTypes } from "../record-types/get-record-types.js";
import { getTaskTypes } from "../task-types/get-task-types.js";

export async function getCreateTaskInfo(): Promise<CreateTaskInfo> {
	const data = await Promise.all([
		getProjects(),
		getBusiness(),
		getTaskTypes(),
		getRecordTypes(),
	])

	return {
		projects: data[0],
		business: data[1],
		taskTypes: data[2],
		recordTypes: data[3],
	}
}

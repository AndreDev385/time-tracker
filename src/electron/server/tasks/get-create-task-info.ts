import { getBusiness } from "../business/get-business.js";
import { getOtherTaskOptions } from "../get-other-tasks-options.js";
import { me } from "../me.js";
import { getProjects } from "../projects/get-projects.js";
import { getRecordTypes } from "../record-types/get-record-types.js";
import { getTaskTypes } from "../task-types/get-task-types.js";
import { getWorkTypes } from "../work-types/get-work-types.js";
import logger from '../../lib/logger.js';

export async function getCreateTaskInfo(): Promise<
	(CreateTaskInfo & SuccessResponse) | ErrorResponse
> {
	logger.info("get-create-task-info: entry");
	try {
		const data = await Promise.all([
			getProjects(),
			getBusiness(),
			getTaskTypes(),
			getRecordTypes(),
			getOtherTaskOptions(),
			getWorkTypes(),
			me(),
		]);

		if (
			!data[0].success ||
			!data[1].success ||
			!data[2].success ||
			!data[3].success ||
			!data[4].success ||
			!data[5].success ||
			!data[6].success
		) {
			return { success: false, error: "Ha ocurrido un error" };
		}

		logger.info("get-create-task-info: success");
		return {
			success: true,
			projects: data[0].projects.filter((p) =>
				(
					data[6] as { user: JWTTokenData } & SuccessResponse
				).user.assignedProjects.includes(p.id),
			),
			business: data[1].businesses,
			taskTypes: data[2].taskTypes,
			recordTypes: data[3].recordTypes,
			otherTaskOptions: data[4].options,
			workTypes: data[5].workTypes,
		};
	} catch (e) {
		logger.error("get-create-task-info: error", { e });
		return { success: false, error: "Ha ocurrido un error" };
	}
}

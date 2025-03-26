import { getMyTasks } from "./get-my-tasks.js";
import { getMyOtherTasks } from "./get-my-other-tasks.js";

export async function todayCompletedTasks(): Promise<{ tasks: Task[], otherTasks: OtherTask[] } & SuccessResponse | ErrorResponse> {
	const today = new Date()
	const result = await Promise.all([
		getMyTasks(['solved', 'canceled'], today),
		getMyOtherTasks(['solved'], today)
	])

	if (!result[0].success || !result[1].success) {
		return { success: false, error: "Ha ocurrido un error" }
	}

	const tasks = result[0].tasks.map(t => ({
		...t,
		intervals: t.intervals.map(int => ({
			startAt: new Date(int.startAt),
			endAt: int.endAt ? new Date(int.endAt) : null,
		}))
	}))

	const otherTasks = result[1].otherTasks.map(t => ({
		...t,
		intervals: t.intervals.map(int => ({
			startAt: new Date(int.startAt),
			endAt: int.endAt ? new Date(int.endAt) : null,
		}))
	}))

	return {
		success: true,
		tasks,
		otherTasks
	}
}

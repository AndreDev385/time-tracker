import { signIn } from "../server/sign-in.js";
import { saveToken } from "../lib/jwt.js";
import { createTask } from "../server/tasks/create-task.js";
import { me } from "../server/me.js";
import { getMyTasks } from "../server/tasks/get-my-tasks.js";
import { getCreateTaskInfo } from "../server/tasks/get-create-task-info.js";
import { getActualJourney } from "../server/journeys/get-actual-journey.js";
import { startJourney } from "../server/journeys/start-journey.js";
import { endJourney } from "../server/journeys/end-journey.js";
import { checkTaskCollision } from "../server/tasks/check-task-collision.js";
import { createOtherTask } from "../server/other-tasks/create-other-task.js";
import { pauseTaskInterval } from "../server/tasks/end-task-interval.js";
import { resumeTask } from "../server/tasks/resume-task.js";
import { completeTask, completeOtherTask } from "../server/tasks/end-task-interval.js";
import { cancelTask } from "../server/tasks/end-task-interval.js";
import { getCurrTask } from "../server/tasks/get-curr-task.js";
import { todayCompletedTasks } from "../server/tasks/today-completed-tasks.js";
import { getTaskHistory } from "../server/tasks/paginate-task-history.js";
import { app } from "electron";
import { isDev } from "../lib/utils.js";
import { getPreloadPath, getToolbarUIPath } from "../lib/path-resolver.js";
import { getTodaysJourneys } from  "../server/journeys/get-todays-journeys.js"
import { WINDOW_TOOLBAR_WIDTH, WINDOW_TOOLBAR_HEIGHT } from "../config.js";

export async function handleSignInSubmit(state: AppState, data: SignInFormData): Promise<{ newState: AppState; effects: Effect[] }> {
	const result = await signIn(data);
	const effects: Effect[] = [];
	if (result.success) {
		saveToken(result.token);
		// Create toolbar if not exists
		if (!state.windows.toolbar) {
			effects.push({
				type: 'createToolbarWindow',
				url: isDev() ? "http://localhost:5123/toolbar.html" : getToolbarUIPath(),
				options: {
					width: WINDOW_TOOLBAR_WIDTH,
					minWidth: 600,
					height: WINDOW_TOOLBAR_HEIGHT,
					minHeight: WINDOW_TOOLBAR_HEIGHT,
					maxHeight: WINDOW_TOOLBAR_HEIGHT,
					titleBarStyle: "hidden",
					frame: false,
					skipTaskbar: true,
					alwaysOnTop: true,
					webPreferences: {
						contextIsolation: true,
						preload: getPreloadPath(),
					},
				},
			});
			// Update tray to include toolbar menu
			effects.push({ type: 'createTray', mainWindow: state.windows.main, toolbarWindow: null, hasJourney: !!state.activeJourney }); // toolbar will be set after creation
		}
		// Start journey
		effects.push({ type: 'startJourney' });
	}
	effects.push({ type: 'sendIPC', channel: 'signInResult', webContents: state.windows.main!.webContents, data: result });
	return { newState: state, effects };
}

export async function handleCheckToken(state: AppState): Promise<{ newState: AppState; effects: Effect[]; result: ({ user: JWTTokenData } & SuccessResponse) | ErrorResponse }> {
	const result = await me();
	return { newState: state, effects: [], result };
}

export async function handleGetMyTasks(state: AppState, statuses: TaskStatus[]): Promise<{ newState: AppState; effects: Effect[]; result: ({ tasks: Task[] } & SuccessResponse) | ErrorResponse }> {
	const result = await getMyTasks(statuses);
	return { newState: state, effects: [], result };
}

export async function handleGetCreateTaskInfo(state: AppState): Promise<{ newState: AppState; effects: Effect[]; result: (CreateTaskInfo & SuccessResponse) | ErrorResponse }> {
	const result = await getCreateTaskInfo();
	return { newState: state, effects: [], result };
}

export async function handleLoadJourney(state: AppState): Promise<{ newState: AppState; effects: Effect[]; result: ({ journey: Journey } & SuccessResponse) | ErrorResponse }> {
	const result = await getActualJourney();
	return { newState: state, effects: [], result };
}

export async function handleGetTodaysJourneys(state: AppState): Promise<{ newState: AppState; effects: Effect[]; result: ({ journeys: Journey[] } & SuccessResponse) | ErrorResponse }> {
	const result = await getTodaysJourneys();
	return { newState: state, effects: [], result };
}

export async function handleStartJourney(state: AppState): Promise<{ newState: AppState; effects: Effect[] }> {
	const result = await startJourney();
	const effects: Effect[] = [];
	if (result.success) {
		effects.push(
			{ type: 'startIdleMonitor' },
			{ type: 'startCaptureMonitor' },
			{ type: 'startHeartbeatInterval' },
			{ type: 'startJourneySyncInterval' },
			{ type: 'sendIPC', channel: 'startJourneyResult', webContents: state.windows.main!.webContents, data: result },
			{ type: 'sendIPC', channel: 'startJourneyResult', webContents: state.windows.toolbar!.webContents, data: result }
		);
		return { newState: { ...state, activeJourney: result.journey }, effects };
	}
	effects.push(
		{ type: 'sendIPC', channel: 'startJourneyResult', webContents: state.windows.main!.webContents, data: result },
		{ type: 'sendIPC', channel: 'startJourneyResult', webContents: state.windows.toolbar!.webContents, data: result }
	);
	return { newState: state, effects };
}

export async function handleEndJourney(state: AppState, journeyId: string): Promise<{ newState: AppState; effects: Effect[] }> {
	const result = await endJourney(journeyId);
	const effects: Effect[] = [];
	if (result.success) {
		effects.push({ type: 'clearIntervals' });
	}
	effects.push(
		{ type: 'sendIPC', channel: 'endJourneyResult', webContents: state.windows.main!.webContents, data: result },
		{ type: 'sendIPC', channel: 'endJourneyResult', webContents: state.windows.toolbar!.webContents, data: result },
		{ type: 'sendIPC', channel: 'reloadToolbarData', webContents: state.windows.toolbar!.webContents, data: result },
		{ type: 'sendIPC', channel: 'reloadPausedTasks', webContents: state.windows.main!.webContents, data: await getMyTasks(["paused"]) }
	);
	return { newState: { ...state, activeJourney: null }, effects };
}

export async function handleCheckTaskCollision(state: AppState, data: CreateTaskFormData): Promise<{ newState: AppState; effects: Effect[] }> {
	const result = await checkTaskCollision(data);
	const effects: Effect[] = [];
	if (!result.success) {
		effects.push({ type: 'sendIPC', channel: 'createTaskResult', webContents: state.windows.main!.webContents, data: result });
		return { newState: state, effects };
	}
	if (!result.collision) {
		// Create the task directly
		const createResult = await createTask(data);
		effects.push(
			{ type: 'sendIPC', channel: 'createTaskResult', webContents: state.windows.main!.webContents, data: createResult },
			{ type: 'sendIPC', channel: 'reloadToolbarData', webContents: state.windows.toolbar!.webContents, data: createResult },
			{ type: 'sendIPC', channel: 'reloadPausedTasks', webContents: state.windows.main!.webContents, data: await getMyTasks(["paused"]) }
		);
		return { newState: state, effects };
	}
	// There's a collision ask if wants to continue
	effects.push(
		{ type: 'showWindow', window: state.windows.main!, app },
		{ type: 'focusWindow', window: state.windows.main! },
		{ type: 'sendIPC', channel: 'checkTaskCollisionResult', webContents: state.windows.main!.webContents, data: { ...result, creationData: data } }
	);
	return { newState: state, effects };
}

export async function handleCreateTaskSubmit(state: AppState, data: CreateTaskFormData): Promise<{ newState: AppState; effects: Effect[] }> {
	const journeyResult = await getActualJourney();
	if (!journeyResult.success || !journeyResult.journey) {
		const errorResult = { success: false, error: 'No active journey' };
		const effects: Effect[] = [
			{ type: 'sendIPC', channel: 'createTaskResult', webContents: state.windows.main!.webContents, data: errorResult },
			{ type: 'sendIPC', channel: 'reloadToolbarData', webContents: state.windows.toolbar!.webContents, data: errorResult }
		];
		return { newState: state, effects };
	}
	const result = await createTask(data);
	const effects: Effect[] = [
		{ type: 'sendIPC', channel: 'createTaskResult', webContents: state.windows.main!.webContents, data: result },
		{ type: 'sendIPC', channel: 'reloadPausedTasks', webContents: state.windows.main!.webContents, data: await getMyTasks(["paused"]) },
		{ type: 'sendIPC', channel: 'reloadToolbarData', webContents: state.windows.toolbar!.webContents, data: result }
	];
	return { newState: state, effects };
}

export async function handleCreateOtherTaskSubmit(state: AppState, data: CreateOtherTaskData): Promise<{ newState: AppState; effects: Effect[] }> {
	const journeyResult = await getActualJourney();
	if (!journeyResult.success || !journeyResult.journey) {
		const errorResult = { success: false, error: 'No active journey' };
		const effects: Effect[] = [
			{ type: 'sendIPC', channel: 'createOtherTaskResult', webContents: state.windows.main!.webContents, data: errorResult },
			{ type: 'sendIPC', channel: 'reloadToolbarData', webContents: state.windows.toolbar!.webContents, data: errorResult }
		];
		return { newState: state, effects };
	}
	const result = await createOtherTask(data);
	const effects: Effect[] = [
		{ type: 'sendIPC', channel: 'createOtherTaskResult', webContents: state.windows.main!.webContents, data: result },
		{ type: 'sendIPC', channel: 'reloadToolbarData', webContents: state.windows.toolbar!.webContents, data: result.success ? { success: true, task: result.otherTask } : result }
	];
	return { newState: state, effects };
}

export async function handlePauseTask(state: AppState, data: { taskId: string }): Promise<{ newState: AppState; effects: Effect[] }> {
	const result = await pauseTaskInterval({ id: data.taskId, comment: "" });
	const effects: Effect[] = [
		{ type: 'sendIPC', channel: 'pauseTaskResult', webContents: state.windows.main!.webContents, data: result },
		{ type: 'sendIPC', channel: 'reloadToolbarData', webContents: state.windows.toolbar!.webContents, data: result },
		{ type: 'sendIPC', channel: 'reloadPausedTasks', webContents: state.windows.main!.webContents, data: await getMyTasks(["paused"]) }
	];
	return { newState: state, effects };
}

export async function handleResumeTask(state: AppState, data: { taskId: string }): Promise<{ newState: AppState; effects: Effect[] }> {
	const journeyResult = await getActualJourney();
	if (!journeyResult.success || !journeyResult.journey) {
		const errorResult = { success: false, error: 'No active journey' };
		const effects: Effect[] = [
			{ type: 'sendIPC', channel: 'resumeTaskResult', webContents: state.windows.main!.webContents, data: errorResult },
			{ type: 'sendIPC', channel: 'reloadToolbarData', webContents: state.windows.toolbar!.webContents, data: errorResult },
		];
		return { newState: state, effects };
	}
	const result = await resumeTask(data.taskId);
	const effects: Effect[] = [
		{ type: 'sendIPC', channel: 'resumeTaskResult', webContents: state.windows.main!.webContents, data: result },
		{ type: 'sendIPC', channel: 'reloadToolbarData', webContents: state.windows.toolbar!.webContents, data: result },
		{ type: 'sendIPC', channel: 'reloadPausedTasks', webContents: state.windows.main!.webContents, data: await getMyTasks(["paused"]) }
	];
	return { newState: state, effects };
}

export async function handleCompleteTask(state: AppState, data: { taskId: string; isOtherTask?: boolean; comment?: string }): Promise<{ newState: AppState; effects: Effect[] }> {
	const effects: Effect[] = [];
	if (data.isOtherTask) {
		const result = await completeOtherTask({ id: data.taskId, comment: data.comment || "" });
		effects.push(
			{ type: 'sendIPC', channel: 'completeOtherTaskResult', webContents: state.windows.main!.webContents, data: result },
			{ type: 'sendIPC', channel: 'reloadToolbarData', webContents: state.windows.toolbar!.webContents, data: result },
			{ type: 'sendIPC', channel: 'reloadTodaysTasks', webContents: state.windows.main!.webContents, data: await todayCompletedTasks() }
		);
	} else {
		const result = await completeTask({ id: data.taskId, comment: data.comment || "" });
		effects.push(
			{ type: 'sendIPC', channel: 'completeTaskResult', webContents: state.windows.main!.webContents, data: result },
			{ type: 'sendIPC', channel: 'reloadToolbarData', webContents: state.windows.toolbar!.webContents, data: result },
			{ type: 'sendIPC', channel: 'reloadTodaysTasks', webContents: state.windows.main!.webContents, data: await todayCompletedTasks() }
		);
	}
	return { newState: state, effects };
}

export async function handleCancelTask(state: AppState, data: { taskId: string; comment?: string }): Promise<{ newState: AppState; effects: Effect[] }> {
	const result = await cancelTask({ id: data.taskId, comment: data.comment || "" });
	const effects: Effect[] = [
		{ type: 'sendIPC', channel: 'cancelTaskResult', webContents: state.windows.main!.webContents, data: result },
		{ type: 'sendIPC', channel: 'reloadToolbarData', webContents: state.windows.toolbar!.webContents, data: result },
		{ type: 'sendIPC', channel: 'reloadTodaysTasks', webContents: state.windows.main!.webContents, data: await todayCompletedTasks() }
	];
	return { newState: state, effects };
}

export async function handleGetCurrTask(state: AppState): Promise<{ newState: AppState; effects: Effect[]; result: ({ task?: Task | OtherTask } & SuccessResponse) | ErrorResponse }> {
	const result = await getCurrTask();
	return { newState: state, effects: [], result };
}

export async function handleOpenMainWindow(state: AppState): Promise<{ newState: AppState; effects: Effect[] }> {
	const effects: Effect[] = [
		{ type: 'showWindow', window: state.windows.main!, app },
		{ type: 'focusWindow', window: state.windows.main! }
	];
	return { newState: state, effects };
}

export async function handleGetTodaysTasks(state: AppState): Promise<{ newState: AppState; effects: Effect[]; result: ({ tasks: Task[]; otherTasks: OtherTask[] } & SuccessResponse) | ErrorResponse }> {
	const result = await todayCompletedTasks();
	return { newState: state, effects: [], result };
}

export async function handleGetTaskHistory(state: AppState, data: { offset: number; limit: number; recordId?: string }): Promise<{ newState: AppState; effects: Effect[] }> {
	const result = await getTaskHistory(data.offset, data.limit, data.recordId);
	const effects: Effect[] = [
		{ type: 'sendIPC', channel: 'getTaskHistoryResult', webContents: state.windows.main!.webContents, data: result }
	];
	return { newState: state, effects };
}

export async function handleLogout(state: AppState): Promise<{ newState: AppState; effects: Effect[] }> {
	saveToken("");
	const effects: Effect[] = [
		{ type: 'sendIPC', channel: 'logoutResult', webContents: state.windows.main!.webContents, data: undefined }
	];
	if (state.windows.toolbar) {
		effects.push({ type: 'hideWindow', window: state.windows.toolbar });
	}
	if (state.activeJourney) {
		effects.push({ type: 'endJourney', journeyId: state.activeJourney.id }, { type: 'clearIntervals' });
	}
	return { newState: { ...state, activeJourney: null }, effects };
}

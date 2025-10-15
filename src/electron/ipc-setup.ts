import { ipcMainHandle, ipcMainOn } from "./lib/ipc-main-handlers.js";
import * as ipcHandlers from "./handlers/ipc-handlers.js";
import { executeEffects } from "./handlers/effects.js";
import { app } from "electron";

export function setupIPC(updateState: (newState: AppState) => void, getState: () => AppState) {
	ipcMainHandle("getAppVersion", () => app.getVersion());

	ipcMainOn("signInSubmit", async (data: SignInFormData) => {
		const { newState, effects } = await ipcHandlers.handleSignInSubmit(getState(), data);
		updateState(newState);
		await executeEffects(effects, getState());
	});

	ipcMainHandle("checkToken", async () => {
		const { result } = await ipcHandlers.handleCheckToken(getState());
		return result;
	});

	ipcMainHandle("getMyTasks", async () => {
		const { result } = await ipcHandlers.handleGetMyTasks(getState(), ["paused"]);
		return result;
	});

	ipcMainHandle("getCreateTaskInfo", async () => {
		const { result } = await ipcHandlers.handleGetCreateTaskInfo(getState());
		return result;
	});

	ipcMainHandle("loadJourney", async () => {
		const { result } = await ipcHandlers.handleLoadJourney(getState());
		return result;
	});

	ipcMainOn("startJourney", async () => {
		const { newState, effects } = await ipcHandlers.handleStartJourney(getState());
		updateState(newState);
		await executeEffects(effects, getState());
	});

	ipcMainOn("endJourney", async (journeyId: string) => {
		const { newState, effects } = await ipcHandlers.handleEndJourney(getState(), journeyId);
		updateState(newState);
		await executeEffects(effects, getState());
	});

	ipcMainOn("checkTaskCollision", async (data: CreateTaskFormData) => {
		const { newState, effects } = await ipcHandlers.handleCheckTaskCollision(getState(), data);
		updateState(newState);
		await executeEffects(effects, getState());
	});

	ipcMainOn("createTaskSubmit", async (data: CreateTaskFormData) => {
		const { newState, effects } = await ipcHandlers.handleCreateTaskSubmit(getState(), data);
		updateState(newState);
		await executeEffects(effects, getState());
	});

	ipcMainOn("createOtherTaskSubmit", async (data: CreateOtherTaskData) => {
		const { newState, effects } = await ipcHandlers.handleCreateOtherTaskSubmit(getState(), data);
		updateState(newState);
		await executeEffects(effects, getState());
	});

	ipcMainOn("pauseTask", async (data: { taskId: string }) => {
		const { newState, effects } = await ipcHandlers.handlePauseTask(getState(), data);
		updateState(newState);
		await executeEffects(effects, getState());
	});

	ipcMainOn("resumeTask", async (data: { taskId: string }) => {
		const { newState, effects } = await ipcHandlers.handleResumeTask(getState(), data);
		updateState(newState);
		await executeEffects(effects, getState());
	});

	ipcMainOn("completeTask", async (data: { taskId: string; isOtherTask?: boolean; comment?: string }) => {
		const { newState, effects } = await ipcHandlers.handleCompleteTask(getState(), data);
		updateState(newState);
		await executeEffects(effects, getState());
	});

	ipcMainOn("cancelTask", async (data: { taskId: string; comment?: string }) => {
		const { newState, effects } = await ipcHandlers.handleCancelTask(getState(), data);
		updateState(newState);
		await executeEffects(effects, getState());
	});

	ipcMainHandle("getCurrTask", async () => {
		const { result } = await ipcHandlers.handleGetCurrTask(getState());
		return result;
	});

	ipcMainOn("openMainWindow", async () => {
		const { newState, effects } = await ipcHandlers.handleOpenMainWindow(getState());
		updateState(newState);
		await executeEffects(effects, getState());
	});

	ipcMainHandle("getTodaysTasks", async () => {
		const { result } = await ipcHandlers.handleGetTodaysTasks(getState());
		return result;
	});

	ipcMainHandle("getTodaysJourneys", async () => {
		const { result } = await ipcHandlers.handleGetTodaysJourneys(getState());
		return result;
	});

	ipcMainOn("getTaskHistory", async (data: { offset: number; limit: number; recordId?: string }) => {
		const { newState, effects } = await ipcHandlers.handleGetTaskHistory(getState(), data);
		updateState(newState);
		await executeEffects(effects, getState());
	});

	ipcMainOn("logout", async () => {
		const { newState, effects } = await ipcHandlers.handleLogout(getState());
		updateState(newState);
		await executeEffects(effects, getState());
	});
}
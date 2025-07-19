import { app, type BrowserWindow, powerMonitor } from "electron";
import { secondsToMilliseconds } from "date-fns";

import { isDev, SETTINGS } from "./lib/utils.js";
import {
	getMainUIPath,
	getPreloadPath,
	getToolbarUIPath,
} from "./lib/path-resolver.js";
import { createTray } from "./tray.js";
import { signIn } from "./server/sign-in.js";
import { saveToken } from "./lib/jwt.js";
import { createTask } from "./server/tasks/create-task.js";
import { me } from "./server/me.js";
import {
	ipcMainHandle,
	ipcMainOn,
	ipcWebContentsSend,
} from "./lib/ipc-main-handlers.js";
import { getCreateTaskInfo } from "./server/tasks/get-create-task-info.js";
import { startJourney } from "./server/journeys/start-journey.js";
import { endJourney } from "./server/journeys/end-journey.js";
import {
	cancelTask,
	completeOtherTask,
	completeTask,
	pauseTaskInterval,
} from "./server/tasks/end-task-interval.js";
import { checkTaskCollision } from "./server/tasks/check-task-collision.js";
import { getMyTasks } from "./server/tasks/get-my-tasks.js";
import { resumeTask } from "./server/tasks/resume-task.js";
import { createOtherTask } from "./server/other-tasks/create-other-task.js";
import { getActualJourney } from "./server/journeys/get-actual-journey.js";
import { getCurrTask } from "./server/tasks/get-curr-task.js";
import { todayCompletedTasks } from "./server/tasks/today-completed-tasks.js";
import { captureScreens } from "./lib/capture-screens.js";
import { uploadFile } from "./lib/upload-captures.js";
import { createWindow, showWindow } from "./window-handlers.js";
import { getAppSettings } from "./server/app-settings.js";
import { getTaskHistory } from "./server/tasks/paginate-task-history.js";
import { saveUserCaptures } from "./server/save-user-capture.js";
import { secondsInMinute } from "date-fns/constants";
import { updateLastHeartBeat } from "./server/journeys/update-last-heart-beat.js";

let activeJourney: Journey | null = null;

app.setLoginItemSettings({
	openAtLogin: true,
});

const DEFAULT_IDLE_TIME_ALLOWED = 300; // 5 minutes
const DEFAULT_CAPTURE_INTERVAL = 300; //

const UPDATE_HEARTBEAT_INTERVAL = 60;

let idleTimeAllowed = DEFAULT_IDLE_TIME_ALLOWED;
let captureEvery = DEFAULT_CAPTURE_INTERVAL;

let idleIntervalRef: NodeJS.Timeout | null = null;
let captureIntervalRef: NodeJS.Timeout | null = null;
let heartbeatIntervalRef: NodeJS.Timeout | null = null;

let mainWindow: BrowserWindow;
let toolbarWindow: BrowserWindow;

app.on("ready", async () => {
	mainWindow = createWindow(
		isDev() ? "http://localhost:5123" : getMainUIPath(),
		{
			width: 1280,
			minWidth: 1000,
			height: 800,
			minHeight: 800,
			webPreferences: {
				preload: getPreloadPath(),
			},
		},
		true,
	);

	toolbarWindow = createWindow(
		isDev() ? "http://localhost:5123/toolbar.html" : getToolbarUIPath(),
		{
			width: 700,
			minWidth: 600,
			height: 30,
			minHeight: 30,
			maxHeight: 30,
			titleBarStyle: "hidden",
			frame: false,
			skipTaskbar: true,
			alwaysOnTop: true,
			webPreferences: {
				contextIsolation: true,
				preload: getPreloadPath(),
			},
		},
		true,
	);

	await checkJourney();

	// check if there's a journey active
	mainWindow.on("close", (e) => {
		if (activeJourney) {
			e.preventDefault();
			mainWindow.hide();
		}
	});

	toolbarWindow.on("close", (e) => {
		if (activeJourney) {
			e.preventDefault();
			toolbarWindow.hide();
			return;
		}
	});

	await loadAppSettings();
	startIntervals();
	createTray(mainWindow, toolbarWindow, !!activeJourney);
});

app.on("before-quit", async (e) => {
	if (activeJourney) {
		e.preventDefault();
		const result = await endJourney(activeJourney.id);
		if (result.success) {
			endJourneyAndIntervals();
			ipcWebContentsSend("endJourneyResult", mainWindow.webContents, result);
			ipcWebContentsSend("endJourneyResult", toolbarWindow.webContents, result);
			app.quit();
		}
	}
});

app.on("window-all-closed", async () => {
	if (activeJourney) {
		await endJourney(activeJourney.id);
		endJourneyAndIntervals();
	}
});

ipcMainOn("signInSubmit", async (data: SignInFormData) => {
	const result = await signIn(data);
	if (result.success) {
		saveToken(result.token);
	}
	ipcWebContentsSend("signInResult", mainWindow.webContents, result);
});

ipcMainHandle("checkToken", () => me());
ipcMainHandle("getMyTasks", () => getMyTasks(["paused"]));

ipcMainHandle("getCreateTaskInfo", () => getCreateTaskInfo());

ipcMainHandle("loadJourney", () => getActualJourney());
ipcMainOn("startJourney", async () => {
	const result = await startJourney();
	if (result.success) {
		activeJourney = result.journey;
		startIntervals();
	}
	ipcWebContentsSend("startJourneyResult", mainWindow.webContents, result);
	ipcWebContentsSend("startJourneyResult", toolbarWindow.webContents, result);
});

ipcMainOn("endJourney", async (journeyId: string) => {
	const result = await endJourney(journeyId);
	if (result.success) {
		endJourneyAndIntervals();
	}
	ipcWebContentsSend("endJourneyResult", mainWindow.webContents, result);
	ipcWebContentsSend("endJourneyResult", toolbarWindow.webContents, result);
	ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result);
	ipcWebContentsSend(
		"reloadPausedTasks",
		mainWindow.webContents,
		await getMyTasks(["paused"]),
	);
});

ipcMainOn("checkTaskCollision", async (data) => {
	const result = await checkTaskCollision(data);
	if (!result.success) {
		ipcWebContentsSend("createTaskResult", mainWindow.webContents, result);
		return;
	}
	if (!result.collision) {
		// Create the task directly
		const result = await createTask(data);
		ipcWebContentsSend("createTaskResult", mainWindow.webContents, result);
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result);
		ipcWebContentsSend(
			"reloadPausedTasks",
			mainWindow.webContents,
			await getMyTasks(["paused"]),
		);
		return;
	}
	// There's a collision ask if wants to continue
	showWindow(mainWindow, app);
	mainWindow.focus();
	ipcWebContentsSend("checkTaskCollisionResult", mainWindow.webContents, {
		...result,
		creationData: data,
	});
});

ipcMainOn("createTaskSubmit", async (data: CreateTaskFormData) => {
	const result = await createTask(data);
	ipcWebContentsSend("createTaskResult", mainWindow.webContents, result);
	ipcWebContentsSend(
		"reloadPausedTasks",
		mainWindow.webContents,
		await getMyTasks(["paused"]),
	);
	ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result);
});

ipcMainOn("createOtherTaskSubmit", async (data) => {
	const result = await createOtherTask(data);
	ipcWebContentsSend("createOtherTaskResult", mainWindow.webContents, result);
	ipcWebContentsSend(
		"reloadToolbarData",
		toolbarWindow.webContents,
		result.success ? { success: true, task: result.otherTask } : result,
	);
});

ipcMainOn("pauseTask", async ({ taskId }) => {
	const result = await pauseTaskInterval({ id: taskId, comment: "" });
	ipcWebContentsSend("pauseTaskResult", mainWindow.webContents, result);
	ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result);
	ipcWebContentsSend(
		"reloadPausedTasks",
		mainWindow.webContents,
		await getMyTasks(["paused"]),
	);
});

ipcMainOn("resumeTask", async (data) => {
	const result = await resumeTask(data.taskId);
	ipcWebContentsSend("resumeTaskResult", mainWindow.webContents, result);
	ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result);
	ipcWebContentsSend(
		"reloadPausedTasks",
		mainWindow.webContents,
		await getMyTasks(["paused"]),
	);
});

ipcMainOn("completeTask", async ({ taskId, isOtherTask, comment = "" }) => {
	if (isOtherTask) {
		const result = await completeOtherTask({ id: taskId, comment });
		ipcWebContentsSend(
			"completeOtherTaskResult",
			mainWindow.webContents,
			result,
		);
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result);
		ipcWebContentsSend(
			"reloadTodaysTasks",
			mainWindow.webContents,
			await todayCompletedTasks(),
		);
	} else {
		const result = await completeTask({ id: taskId, comment });
		ipcWebContentsSend("completeTaskResult", mainWindow.webContents, result);
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result);
		ipcWebContentsSend(
			"reloadTodaysTasks",
			mainWindow.webContents,
			await todayCompletedTasks(),
		);
	}
});

ipcMainOn("cancelTask", async ({ taskId, comment = "" }) => {
	const result = await cancelTask({ id: taskId, comment });
	ipcWebContentsSend("cancelTaskResult", mainWindow.webContents, result);
	ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result);
	ipcWebContentsSend(
		"reloadTodaysTasks",
		mainWindow.webContents,
		await todayCompletedTasks(),
	);
});

ipcMainHandle("getCurrTask", () => getCurrTask());

ipcMainOn("openMainWindow", () => {
	showWindow(mainWindow, app);
	mainWindow.focus();
});

ipcMainHandle("getTodaysTasks", () => todayCompletedTasks());

ipcMainOn("getTaskHistory", async ({ offset, limit, recordId }) => {
	const result = await getTaskHistory(offset, limit, recordId);
	ipcWebContentsSend("getTaskHistoryResult", mainWindow.webContents, result);
});

ipcMainOn("logout", () => {
	saveToken("");
	ipcWebContentsSend("logoutResult", mainWindow.webContents, undefined);
});

async function checkJourney() {
	const result = await getActualJourney();
	if (result.success) {
		activeJourney = result.journey;
		startIntervals();
	}
}

async function loadAppSettings() {
	try {
		const result = await getAppSettings();

		if (!result.success) throw new Error("Failed to fetch settings");

		for (const setting of result.settings) {
			switch (setting.name) {
				case SETTINGS.INACTIVE_TIME_ALLOWED:
					idleTimeAllowed = Number(setting.value) || DEFAULT_IDLE_TIME_ALLOWED;
					break;
				case SETTINGS.INTERVAL_BETWEEN_CAPTURES:
					captureEvery = Number(setting.value) || DEFAULT_CAPTURE_INTERVAL;
					break;
			}
		}
	} catch (err) {
		console.error("Error loading settings:", err);
		idleTimeAllowed = DEFAULT_IDLE_TIME_ALLOWED;
		captureEvery = DEFAULT_CAPTURE_INTERVAL;
	}
}

function startIdleMonitor() {
	if (idleIntervalRef) clearInterval(idleIntervalRef);

	idleIntervalRef = setInterval(async () => {
		const idleTime = powerMonitor.getSystemIdleTime();
		if (idleTime >= idleTimeAllowed && activeJourney) {
			const result = await endJourney(activeJourney.id);
			if (result.success) {
				endJourneyAndIntervals();
				ipcWebContentsSend("endJourneyResult", mainWindow.webContents, result);
				ipcWebContentsSend(
					"endJourneyResult",
					toolbarWindow.webContents,
					result,
				);

				const pausedTasks = await getMyTasks(["paused"]);
				ipcWebContentsSend(
					"reloadPausedTasks",
					mainWindow.webContents,
					pausedTasks,
				);
			}
		}
	}, secondsToMilliseconds(secondsInMinute));
}

function startCaptureMonitor() {
	if (captureIntervalRef) clearInterval(captureIntervalRef);

	captureIntervalRef = setInterval(async () => {
		try {
			if (!activeJourney) return;

			const dataUrls = await captureScreens();

			const urls: string[] = [];

			for (const data of dataUrls) {
				const url = await uploadFile(data);
				if (url) urls.push(url);
			}

			await saveUserCaptures(urls);
		} catch (err) {
			console.error("Error during capture upload:", err);
		}
	}, secondsToMilliseconds(captureEvery));
}

function startHeartBeatInterval() {
	if (heartbeatIntervalRef) clearInterval(heartbeatIntervalRef);

	heartbeatIntervalRef = setInterval(async () => {
		if (!activeJourney) return;
		await updateLastHeartBeat();
	}, secondsToMilliseconds(UPDATE_HEARTBEAT_INTERVAL));
}

function endJourneyAndIntervals() {
	activeJourney = null;
	if (idleIntervalRef) clearInterval(idleIntervalRef);
	if (captureIntervalRef) clearInterval(captureIntervalRef);
	if (heartbeatIntervalRef) clearInterval(heartbeatIntervalRef);
}

function startIntervals() {
	startIdleMonitor();
	startCaptureMonitor();
	startHeartBeatInterval();
}

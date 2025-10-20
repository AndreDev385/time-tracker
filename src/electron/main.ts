import { app, powerMonitor } from "electron";
import { secondsToMilliseconds } from "date-fns";

import { SETTINGS } from "./lib/utils.js";
import {
	ipcWebContentsSend,
} from "./lib/ipc-main-handlers.js";
import { endJourney } from "./server/journeys/end-journey.js";
import { getMyTasks } from "./server/tasks/get-my-tasks.js";
import { getActualJourney } from "./server/journeys/get-actual-journey.js";
import { captureScreens } from "./lib/capture-screens.js";
import { uploadFile } from "./lib/upload-captures.js";
import { getAppSettings } from "./server/app-settings.js";
import { saveUserCaptures } from "./server/save-user-capture.js";
import { secondsInMinute } from "date-fns/constants";
import { updateLastHeartBeat } from "./server/journeys/update-last-heart-beat.js";

import { DEFAULT_IDLE_TIME_ALLOWED, DEFAULT_CAPTURE_INTERVAL, UPDATE_HEARTBEAT_INTERVAL } from "./config.js";
import { handleAppReady, handleAppBeforeQuit, handleAppWindowAllClosed } from "./handlers/app-handlers.js";
import { setupIPC } from "./ipc-setup.js";
import { executeEffects } from "./handlers/effects.js";
import { saveWindowPositions } from "./lib/window-positions.js";
import logger from './lib/logger.js';

function createInitialAppState(): AppState {
	return {
		activeJourney: null,
		settings: {
			idleTimeAllowed: DEFAULT_IDLE_TIME_ALLOWED,
			captureEvery: DEFAULT_CAPTURE_INTERVAL,
		},
		intervals: {
			idle: null,
			capture: null,
			heartbeat: null,
			journeySync: null,
		},
		windows: {
			main: null,
			toolbar: null,
		},
	};
}

let appState: AppState = createInitialAppState();

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit();
} else {
	app.on('second-instance', () => {
		// Focus existing windows when a second instance is attempted
		if (appState.windows.main) {
			appState.windows.main.show();
			appState.windows.main.focus();
		}
		if (appState.windows.toolbar) {
			appState.windows.toolbar.show();
			appState.windows.toolbar.focus();
		}
	});

	app.on("ready", async () => {
		const { newState, effects } = await handleAppReady(appState);
		appState = newState;
		await executeEffects(effects, appState);

		// Window close handlers (keep for now, could refactor later)
		appState.windows.main!.on("close", (e: Event) => {
			if (appState.activeJourney) {
				e.preventDefault();
				appState.windows.main!.hide();
			}
		});

		if (appState.windows.toolbar) {
			appState.windows.toolbar.on("close", (e: Event) => {
				if (appState.activeJourney) {
					e.preventDefault();
					appState.windows.toolbar!.hide();
				}
			});
		}
	});

	app.on("before-quit", async (e) => {
		// Save window positions before quitting
		const positions: { main?: Electron.Rectangle; toolbar?: Electron.Rectangle } = {};
		if (appState.windows.main) {
			positions.main = appState.windows.main.getBounds();
		}
		if (appState.windows.toolbar) {
			positions.toolbar = appState.windows.toolbar.getBounds();
		}
		saveWindowPositions(positions);
		const { newState, effects } = await handleAppBeforeQuit(appState, e);
		appState = newState;
		await executeEffects(effects, appState);
	});

	app.on("window-all-closed", async () => {
		const { newState, effects } = await handleAppWindowAllClosed(appState);
		appState = newState;
		await executeEffects(effects, appState);
	});
}

setupIPC((newState: AppState) => { appState = newState; }, () => appState);

export async function checkJourney() {
	const result = await getActualJourney();
	if (result.success) {
		appState.activeJourney = result.journey;
		startIntervals();
	}
}

export async function loadAppSettings() {
	try {
		const result = await getAppSettings();

		if (!result.success) throw new Error("Failed to fetch settings");

		for (const setting of result.settings) {
			switch (setting.name) {
				case SETTINGS.INACTIVE_TIME_ALLOWED:
					appState.settings.idleTimeAllowed = Number(setting.value) || DEFAULT_IDLE_TIME_ALLOWED;
					break;
				case SETTINGS.INTERVAL_BETWEEN_CAPTURES:
					appState.settings.captureEvery = Number(setting.value) || DEFAULT_CAPTURE_INTERVAL;
					break;
			}
		}
	} catch (err) {
		logger.error("Error loading settings", { error: err });
		appState.settings.idleTimeAllowed = DEFAULT_IDLE_TIME_ALLOWED;
		appState.settings.captureEvery = DEFAULT_CAPTURE_INTERVAL;
	}
}

export function startIdleMonitor(): NodeJS.Timeout {
	const interval = setInterval(async () => {
		const idleTime = powerMonitor.getSystemIdleTime();
		if (idleTime >= appState.settings.idleTimeAllowed && appState.activeJourney) {
			const result = await endJourney(appState.activeJourney.id);
			if (result.success) {
				endJourneyAndIntervals();
				ipcWebContentsSend("endJourneyResult", appState.windows.main!.webContents, result);
				ipcWebContentsSend(
					"endJourneyResult",
					appState.windows.toolbar!.webContents,
					result,
				);

				const pausedTasks = await getMyTasks(["paused"]);
				ipcWebContentsSend(
					"reloadPausedTasks",
					appState.windows.main!.webContents,
					pausedTasks,
				);
			}
		}
	}, secondsToMilliseconds(secondsInMinute));
	return interval;
}

export function startCaptureMonitor(): NodeJS.Timeout {
	const interval = setInterval(async () => {
		try {
			if (!appState.activeJourney) return;

			const dataUrls = await captureScreens();

			const urls: string[] = [];

			for (const data of dataUrls) {
				const url = await uploadFile(data);
				if (url) urls.push(url);
			}

			await saveUserCaptures(urls);
		} catch (err) {
			logger.error("Error during capture upload", { error: err });
		}
	}, secondsToMilliseconds(appState.settings.captureEvery));
	return interval;
}

export function startHeartBeatInterval(): NodeJS.Timeout {
	const interval = setInterval(async () => {
		if (!appState.activeJourney) return;
		await updateLastHeartBeat();
	}, secondsToMilliseconds(UPDATE_HEARTBEAT_INTERVAL));
	return interval;
}

export function startJourneySyncInterval(): NodeJS.Timeout {
	const interval = setInterval(async () => {
		try {
			const journeyResult = await getActualJourney();
			if (!journeyResult.success) {
				// Journey was ended by server, clean up local state
				if (appState.intervals.heartbeat) {
					clearInterval(appState.intervals.heartbeat);
					appState.intervals.heartbeat = null;
				}
				if (appState.intervals.idle) {
					clearInterval(appState.intervals.idle);
					appState.intervals.idle = null;
				}
				if (appState.intervals.capture) {
					clearInterval(appState.intervals.capture);
					appState.intervals.capture = null;
				}
				if (appState.intervals.journeySync) {
					clearInterval(appState.intervals.journeySync);
					appState.intervals.journeySync = null;
				}
				appState.activeJourney = null;

				// Notify UI about journey ending
				if (appState.windows.toolbar?.webContents) {
					appState.windows.toolbar.webContents.send('reloadToolbarData', { success: false, error: 'Journey ended by server' });
				}
				if (appState.windows.main?.webContents) {
					const pausedTasks = await getMyTasks(["paused"]);
					appState.windows.main.webContents.send('reloadPausedTasks', pausedTasks);
				}
			} else {
				// Journey still active, update local state if needed
				appState.activeJourney = journeyResult.journey;
			}
		} catch (error) {
			console.error("Journey sync check failed", error);
		}
	}, 30000); // Check every 30 seconds
	return interval;
}

export function endJourneyAndIntervals() {
	appState.activeJourney = null;
	if (appState.intervals.idle) clearInterval(appState.intervals.idle);
	if (appState.intervals.capture) clearInterval(appState.intervals.capture);
	if (appState.intervals.heartbeat) clearInterval(appState.intervals.heartbeat);
	if (appState.intervals.journeySync) clearInterval(appState.intervals.journeySync);
}

function startIntervals() {
	startIdleMonitor();
	startCaptureMonitor();
	startHeartBeatInterval();
}

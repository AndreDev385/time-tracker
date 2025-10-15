import { ipcWebContentsSend } from "../lib/ipc-main-handlers.js";
import { createTray } from "../tray.js";
import { showWindow, createWindow } from "../window-handlers.js";
import { app } from "electron";
import { endJourney } from "../server/journeys/end-journey.js";
import { loadAppSettings } from "../main.js";
import { checkJourney } from "../main.js";
import { startIdleMonitor, startCaptureMonitor, startHeartBeatInterval, endJourneyAndIntervals } from "../main.js";
import { handleStartJourney } from "./ipc-handlers.js";

export async function executeEffect(effect: Effect, appState: AppState) {
	switch (effect.type) {
		case 'sendIPC':
			ipcWebContentsSend(effect.channel as keyof EventPayloadMapping, effect.webContents, effect.data as any);
			break;
		case 'startIdleMonitor':
			appState.intervals.idle = startIdleMonitor();
			break;
		case 'startCaptureMonitor':
			appState.intervals.capture = startCaptureMonitor();
			break;
		case 'startHeartbeatInterval':
			appState.intervals.heartbeat = startHeartBeatInterval();
			break;
		case 'clearIntervals':
			endJourneyAndIntervals();
			break;
		case 'createMainWindow':
			appState.windows.main = createWindow(effect.url, effect.options, true);
			break;
		case 'createToolbarWindow':
			appState.windows.toolbar = createWindow(effect.url, effect.options, true);
			break;
		case 'showWindow':
			showWindow(effect.window, effect.app);
			break;
		case 'focusWindow':
			effect.window.focus();
			break;
		case 'hideWindow':
			effect.window.hide();
			break;
		case 'quitApp':
			app.quit();
			break;
		case 'preventDefault':
			effect.event.preventDefault();
			break;
		case 'endJourney':
			await endJourney(effect.journeyId);
			break;
		case 'loadSettings':
			await loadAppSettings();
			break;
		case 'checkJourney':
			await checkJourney();
			break;
		case 'createTray':
			createTray(effect.mainWindow, effect.toolbarWindow, effect.hasJourney);
			break;
		case 'startJourney': {
			// Start journey by calling the handler
			const journeyResult = await handleStartJourney(appState);
			// Update state and execute effects
			Object.assign(appState, journeyResult.newState);
			await executeEffects(journeyResult.effects, appState);
			break;
		}
	}
}

export async function executeEffects(effects: Effect[], appState: AppState) {
	for (const effect of effects) {
		await executeEffect(effect, appState);
	}
}
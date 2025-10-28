import { isDev, SETTINGS } from "../lib/utils.js";
import {
	getMainUIPath,
	getPreloadPath,
	getToolbarUIPath,
} from "../lib/path-resolver.js";
import { getActualJourney } from "../server/journeys/get-actual-journey.js";
import { getAppSettings } from "../server/app-settings.js";
import { endJourney } from "../server/journeys/end-journey.js";
import { createWindow } from "../window-handlers.js";
import { DEFAULT_IDLE_TIME_ALLOWED, DEFAULT_CAPTURE_INTERVAL, WINDOW_MAIN_WIDTH, WINDOW_MAIN_HEIGHT, WINDOW_MAIN_MIN_WIDTH, WINDOW_MAIN_MIN_HEIGHT, WINDOW_TOOLBAR_WIDTH, WINDOW_TOOLBAR_HEIGHT } from "../config.js";
import { loadWindowPositions } from "../lib/window-positions.js";
import { readToken } from "../lib/jwt.js";
import { me } from "../server/me.js";
import logger from '../lib/logger.js';

export async function handleAppReady(state: AppState): Promise<{ newState: AppState; effects: Effect[] }> {
	const newState = { ...state };

	// Load saved window positions
	const positions = loadWindowPositions();

	// Check authentication
	const token = readToken()?.token;
	let isAuthenticated = false;
	if (token) {
		const authResult = await me();
		isAuthenticated = authResult.success;
	}

	// Create windows (synchronous, update state directly)
	newState.windows.main = createWindow(
		isDev() ? "http://localhost:5123" : getMainUIPath(),
		{
			width: WINDOW_MAIN_WIDTH,
			minWidth: WINDOW_MAIN_MIN_WIDTH,
			height: WINDOW_MAIN_HEIGHT,
			minHeight: WINDOW_MAIN_MIN_HEIGHT,
			...(positions.main && { x: positions.main.x, y: positions.main.y }),
			webPreferences: {
				preload: getPreloadPath(),
			},
		},
		true,
	);

	if (isAuthenticated) {
		newState.windows.toolbar = createWindow(
			isDev() ? "http://localhost:5123/toolbar.html" : getToolbarUIPath(),
			{
				width: WINDOW_TOOLBAR_WIDTH,
				minWidth: 600,
				height: WINDOW_TOOLBAR_HEIGHT,
				minHeight: WINDOW_TOOLBAR_HEIGHT,
				maxHeight: WINDOW_TOOLBAR_HEIGHT,
				...(positions.toolbar && { x: positions.toolbar.x, y: positions.toolbar.y }),
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

		// Check journey only if authenticated
		const journeyResult = await getActualJourney();
		if (journeyResult.success) {
			newState.activeJourney = journeyResult.journey;
		}
	}

	// Load settings (async, updates state)
	try {
		const settingsResult = await getAppSettings();
		if (settingsResult.success) {
			for (const setting of settingsResult.settings) {
				switch (setting.name) {
					case SETTINGS.INACTIVE_TIME_ALLOWED:
						newState.settings.idleTimeAllowed = Number(setting.value) || DEFAULT_IDLE_TIME_ALLOWED;
						break;
					case SETTINGS.INTERVAL_BETWEEN_CAPTURES:
						newState.settings.captureEvery = Number(setting.value) || DEFAULT_CAPTURE_INTERVAL;
						break;
				}
			}
		} else {
			newState.settings.idleTimeAllowed = DEFAULT_IDLE_TIME_ALLOWED;
			newState.settings.captureEvery = DEFAULT_CAPTURE_INTERVAL;
		}
	} catch (err) {
		logger.error("Error loading settings", { error: err });
		newState.settings.idleTimeAllowed = DEFAULT_IDLE_TIME_ALLOWED;
		newState.settings.captureEvery = DEFAULT_CAPTURE_INTERVAL;
	}

	const effects: Effect[] = [];
	if (newState.activeJourney) {
		effects.push({ type: 'startIdleMonitor' }, { type: 'startCaptureMonitor' }, { type: 'startHeartbeatInterval' }, { type: 'startJourneySyncInterval' });
	}
	effects.push({ type: 'createTray', mainWindow: newState.windows.main, toolbarWindow: newState.windows.toolbar, hasJourney: !!newState.activeJourney });

	return { newState, effects };
}

export async function handleAppBeforeQuit(state: AppState, event: Electron.Event): Promise<{ newState: AppState; effects: Effect[] }> {
	if (state.activeJourney) {
		event.preventDefault();
		const result = await endJourney(state.activeJourney.id);
		if (result.success) {
			const effects: Effect[] = [
				{ type: 'clearIntervals' },
				{ type: 'sendIPC', channel: 'endJourneyResult', webContents: state.windows.main!.webContents, data: result },
				{ type: 'sendIPC', channel: 'endJourneyResult', webContents: state.windows.toolbar!.webContents, data: result },
				{ type: 'quitApp' },
			];
			return { newState: { ...state, activeJourney: null }, effects };
		}
	}
	return { newState: state, effects: [] };
}

export async function handleAppWindowAllClosed(state: AppState): Promise<{ newState: AppState; effects: Effect[] }> {
	if (state.activeJourney) {
		await endJourney(state.activeJourney.id);
		const effects: Effect[] = [
			{ type: 'clearIntervals' },
		];
		return { newState: { ...state, activeJourney: null }, effects };
	}
	const effects: Effect[] = [{ type: 'quitApp' }];
	return { newState: state, effects };
}

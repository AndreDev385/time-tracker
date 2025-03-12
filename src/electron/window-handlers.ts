import { BrowserWindow } from "electron";
import { isDev } from "./lib/utils.js";

export function showWindow(window: BrowserWindow) {
	if (window && !window.isDestroyed()) {
		window.show();
	} else {
		console.log('Toolbar window does not exist or was destroyed');
	}
}

export function hideWindow(window: BrowserWindow, app: Electron.App) {
	if (window && !window.isDestroyed()) {
		window.hide();
	}

	if (app.dock) {
		app.dock.hide();
	}
}

export function createWindow(
	urlOrFile: string,
	options: Electron.BrowserWindowConstructorOptions,
	show: boolean = true
): BrowserWindow {
	const win = new BrowserWindow({
		...options,
		show,
	})

	if (isDev()) {
		win.loadURL(urlOrFile)
	} else {
		win.loadFile(urlOrFile)
	}

	return win
}

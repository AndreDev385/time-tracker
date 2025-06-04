import { type BrowserWindow, Menu, Tray, app } from "electron";
import { getAssetPath } from "./lib/path-resolver.js";
import path from "node:path";

export function createTray(
	mainWindow: BrowserWindow,
	toolbarWindow: BrowserWindow,
	actualJourney: boolean,
) {
	const tray = new Tray(path.join(getAssetPath(), "reloj.png"));

	tray.setContextMenu(
		Menu.buildFromTemplate([
			{
				label: "Principal",
				click: () => {
					if (mainWindow.isVisible()) {
						mainWindow.hide();
						if (app.dock) {
							app.dock.hide();
						}
					} else {
						mainWindow.show();
						if (app.dock) {
							app.dock.show();
						}
					}
				},
			},
			{
				label: "Toolbar",
				enabled: !actualJourney,
				click: () => {
					if (toolbarWindow.isVisible()) {
						toolbarWindow.hide();
					} else {
						toolbarWindow.show();
					}
				},
			},
			{
				label: "Salir",
				click: () => {
					if (app.dock) {
						app.dock.hide();
					}
					app.quit();
				},
			},
		]),
	);
}

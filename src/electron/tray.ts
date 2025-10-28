import { type BrowserWindow, Menu, Tray, app } from "electron";
import { getAssetPath } from "./lib/path-resolver.js";
import path from "node:path";

export function createTray(
	mainWindow: BrowserWindow,
	toolbarWindow: BrowserWindow | null,
	actualJourney: boolean,
) {
	const tray = new Tray(path.join(getAssetPath(), "reloj.png"));

	const menuTemplate: Electron.MenuItemConstructorOptions[] = [
		{
			label: "Principal",
			click: () => {
				if (mainWindow.isVisible()) {
					mainWindow.hide();
					if (app.dock) {
						app.dock.hide();
					}
				} else {
					if (!mainWindow.isDestroyed()) {
						mainWindow.show();
						if (app.dock) {
							app.dock.show();
						}
					}
				}
			},
		},
	];

	if (toolbarWindow) {
		menuTemplate.push({
			label: "Toolbar",
			enabled: !actualJourney,
			click: () => {
				if (toolbarWindow!.isVisible()) {
					toolbarWindow!.hide();
				} else {
					if (!toolbarWindow!.isDestroyed()) {
						toolbarWindow!.show();
					}
				}
			},
		});
	}

	menuTemplate.push({
		label: "Salir",
		click: () => {
			if (app.dock) {
				app.dock.hide();
			}
			app.quit();
		},
	});

	tray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
}

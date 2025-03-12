import { BrowserWindow, Menu, Tray, app } from 'electron';
import { getAssetPath } from './lib/path-resolver.js';
import path from 'path';

export function createTray(mainWindow: BrowserWindow, toolbarWindow: BrowserWindow) {
	const tray = new Tray(
		path.join(
			getAssetPath(), 'reloj.png'
		)
	);

	tray.setContextMenu(
		Menu.buildFromTemplate([
			{
				label: 'Abrir',
				click: () => {
					mainWindow.show();
					if (app.dock) {
						app.dock.show();
					}
				},
			},
			{
				label: 'Toolbar',
				click: () => {
					toolbarWindow.show();
				},
			},
			{
				label: 'Salir',
				click: () => {
					if (app.dock) {
						app.dock.hide()
					}
					app.quit()
				},
			},
		])
	);
}

import { BrowserWindow, Menu, Tray, app } from 'electron';
import { getAssetPath } from './lib/path-resolver.js';
import path from 'path';

export function createTray(mainWindow: BrowserWindow) {
	const tray = new Tray(
		path.join(
			getAssetPath(),
			//process.platform === 'darwin' ? 'trayIconTemplate.png' : 'trayIcon.png'
			'reloj.png'
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
				label: 'Salir',
				click: () => app.quit(),
			},
		])
	);
}

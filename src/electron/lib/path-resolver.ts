import path from 'path';
import { app } from 'electron';
import { isDev } from './utils.js';

export function getPreloadPath() {
	return path.join(
		app.getAppPath(),
		isDev() ? '.' : '..',
		'/dist-electron/preload.cjs'
	);
}

export function getMainUIPath() {
	return path.join(app.getAppPath(), '/dist-react/index.html');
}

export function getToolbarUIPath() {
	return path.join(app.getAppPath(), '/dist-react/toolbar.html');
}

export function getAssetPath() {
	return path.join(app.getAppPath(), isDev() ? '.' : '..', '/src/assets');
}

import { WebFrameMain } from 'electron';
import { getMainUIPath } from './path-resolver.js';
import { pathToFileURL } from 'url';
import { config } from '../config.js';

export function isDev(): boolean {
	return config.nodeEnv === 'development';
}

export function validateEventFrame(frame: WebFrameMain) {
	if (isDev() && new URL(frame.url).host === 'localhost:5123') {
		return;
	}
	if (frame.url !== pathToFileURL(getMainUIPath()).toString()) {
		throw new Error('Malicious event');
	}
}

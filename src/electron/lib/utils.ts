import { WebFrameMain } from 'electron';
import { config } from '../config.js';

export function isDev(): boolean {
	return config.nodeEnv === 'development';
}

export function validateEventFrame(frame: WebFrameMain) {
	if (isDev() && new URL(frame.url).host === 'localhost:5123') {
		return;
	}
}

export const SETTINGS = {
	MINIMUM_TIME_FOR_SECOND_FASE: "MINIMUM_TIME_FOR_SECOND_FASE",
	INACTIVE_TIME_ALLOWED: "INACTIVE_TIME_ALLOWED",
	INTERVAL_BETWEEN_CAPTURES: "INTERVAL_BETWEEN_CAPTURES",
} as const;

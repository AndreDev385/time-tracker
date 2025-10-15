import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { screen, Rectangle } from 'electron';
import logger from './logger.js';

const POSITIONS_FILE = path.join(app.getPath('userData'), 'window-positions.json');

export function saveWindowPositions(positions: { main?: Rectangle; toolbar?: Rectangle }) {
	try {
		fs.writeFileSync(POSITIONS_FILE, JSON.stringify(positions, null, 2));
	} catch (error) {
		logger.error('Failed to save window positions', { error });
	}
}

export function loadWindowPositions(): { main?: Rectangle; toolbar?: Rectangle } {
	try {
		if (!fs.existsSync(POSITIONS_FILE)) return {};
		const data = fs.readFileSync(POSITIONS_FILE, 'utf-8');
		const positions = JSON.parse(data);
		// Validate positions
		const validated: { main?: Rectangle; toolbar?: Rectangle } = {};
		if (positions.main && isValidPosition(positions.main)) {
			validated.main = positions.main;
		}
		if (positions.toolbar && isValidPosition(positions.toolbar)) {
			validated.toolbar = positions.toolbar;
		}
		return validated;
	} catch (error) {
		logger.error('Failed to load window positions', { error });
		return {};
	}
}

function isValidPosition(bounds: Rectangle): boolean {
	const displays = screen.getAllDisplays();
	for (const display of displays) {
		if (
			bounds.x >= display.bounds.x &&
			bounds.y >= display.bounds.y &&
			bounds.x + bounds.width <= display.bounds.x + display.bounds.width &&
			bounds.y + bounds.height <= display.bounds.y + display.bounds.height
		) {
			return true;
		}
	}
	return false;
}
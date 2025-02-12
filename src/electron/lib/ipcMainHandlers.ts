import { ipcMain, WebContents } from 'electron';
import { validateEventFrame } from './utils.js';

export function ipcMainHandle<Key extends keyof EventPayloadMapping>(
	key: Key,
	handler: () => EventPayloadMapping[Key]
) {
	ipcMain.handle(key, (event) => {
		validateEventFrame(event.senderFrame!);
		return handler();
	});
}

export function ipcMainOn<Key extends keyof EventPayloadMapping>(
	key: Key,
	handler: (payload: EventPayloadMapping[Key]) => void,
) {
	ipcMain.on(key, (event, payload) => {
		validateEventFrame(event.senderFrame!);
		return handler(payload);
	});
}

export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(
	key: Key,
	webContents: WebContents,
	payload: EventPayloadMapping[Key]
) {
	webContents.send(key, payload);
}

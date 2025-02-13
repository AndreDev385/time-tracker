// renderer
import electron from 'electron'

electron.contextBridge.exposeInMainWorld('electron', {
	signInSubmit: (data: SignInFormData) => {
		ipcSend('signInSubmit', data);
	},
	signInResult: (callback) => {
		ipcOn('signInResult', (data) => {
			callback(data)
		})
	},

	checkToken: async () => await ipcInvoke('checkToken'),

	startSession: () => {
		ipcSend('startSession', undefined);
	},
	startSessionResult: (callback) => {
		ipcOn('startSessionResult', (data) => {
			callback(data)
		})
	},
	endSession: (id: number) => {
		ipcSend('endSession', id);
	},
	endSessionResult: (callback) => {
		ipcOn('endSessionResult', (data) => {
			callback(data)
		})
	},

	createTaskSubmit: (data: CreateTaskFormData) => {
		ipcSend('createTaskSubmit', data);
	}
} satisfies Window['electron'])

// ----------------------------
// ----------------------------

function ipcInvoke<Key extends keyof EventPayloadMapping>(
	key: Key
): Promise<EventPayloadMapping[Key]> {
	return electron.ipcRenderer.invoke(key);
}

function ipcOn<Key extends keyof EventPayloadMapping>(
	key: Key,
	callback: (payload: EventPayloadMapping[Key]) => void
) {
	const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload);
	electron.ipcRenderer.on(key, cb);
	return () => electron.ipcRenderer.off(key, cb);
}

function ipcSend<Key extends keyof EventPayloadMapping>(
	key: Key,
	payload: EventPayloadMapping[Key]
) {
	electron.ipcRenderer.send(key, payload);
}

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

	startJourney: () => {
		ipcSend('startJourney', undefined);
	},
	startJourneyResult: (callback) => {
		ipcOn('startJourneyResult', (data) => {
			callback(data)
		})
	},
	endJourney: (id: number) => {
		ipcSend('endJourney', id);
	},
	endJourneyResult: (callback) => {
		ipcOn('endJourneyResult', (data) => {
			callback(data)
		})
	},

	getCreateTaskInfo: async () => await ipcInvoke("getCreateTaskInfo"),

	createTaskSubmit: (data: CreateTaskFormData) => {
		ipcSend('createTaskSubmit', data);
	},
	createTaskResult: (callback) => {
		ipcOn('createTaskResult', (data) => {
			callback(data)
		})
	},

	pauseTask(data) {
		ipcSend('pauseTask', data);
	},
	pauseTaskResult: (callback) => {
		ipcOn('pauseTaskResult', (data) => {
			callback(data)
		})
	},
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

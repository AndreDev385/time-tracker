// renderer
import electron from 'electron'

electron.contextBridge.exposeInMainWorld('electron', {
	takeScreenshot: () => {
		ipcSend("takeScreenshot", undefined)
	},
	screenShotResult(callback) {
		ipcOn("screenShotResult", (data) => {
			callback(data)
		})
	},

	signInSubmit: (data: SignInFormData) => {
		ipcSend('signInSubmit', data);
	},
	signInResult: (callback) => {
		ipcOn('signInResult', (data) => {
			callback(data)
		})
	},

	checkToken: async () => await ipcInvoke('checkToken'),
	getMyTasks: async () => await ipcInvoke('getMyTasks'),

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

	checkTaskCollision: (data: CreateTaskFormData) => {
		ipcSend("checkTaskCollision", data)
	},
	checkTaskCollisionResult: (callback) => {
		ipcOn('checkTaskCollisionResult', (data) => {
			callback(data)
		})
	},

	createTaskSubmit: (data: CreateTaskFormData) => {
		ipcSend('createTaskSubmit', data);
	},
	createTaskResult: (callback) => {
		ipcOn('createTaskResult', (data) => {
			callback(data)
		})
	},

	createOtherTaskSubmit(data) {
		ipcSend('createOtherTaskSubmit', data);
	},
	createOtherTaskResult(callback) {
		ipcOn('createOtherTaskResult', (data) => {
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

	resumeTask(data) {
		ipcSend('resumeTask', data);
	},
	resumeTaskResult: (callback) => {
		ipcOn('resumeTaskResult', (data) => {
			callback(data)
		})
	},

	completeTask(data) {
		ipcSend('completeTask', data);
	},
	completeTaskResult: (callback) => {
		ipcOn('completeTaskResult', (data) => {
			callback(data)
		})
	},
	completeOtherTaskResult(callback) {
		ipcOn('completeOtherTaskResult', (data) => {
			callback(data)
		})
	},

	cancelTask(data) {
		ipcSend('cancelTask', data);
	},
	cancelTaskResult: (callback) => {
		ipcOn('cancelTaskResult', (data) => {
			callback(data)
		})
	},

	getToolbarTask: async () => await ipcInvoke("getToolbarTask"),
	reloadToolbarData: (callback) => {
		ipcOn('reloadToolbarData', (data) => {
			callback(data)
		})
	},

	openMainWindow: () => {
		ipcSend("openMainWindow", undefined)
	},
	getTodaysTasks: async () => ipcInvoke("getTodaysTasks")

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

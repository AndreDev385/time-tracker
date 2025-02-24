import path from 'node:path'
import { app, BrowserWindow } from 'electron'
import { isDev } from './lib/utils.js'
import { getPreloadPath } from './lib/path-resolver.js'
import { createTray } from './tray.js'
import { signIn } from './server/sign-in.js'
import { saveToken } from './lib/jwt.js'
import { createTask } from './server/tasks/create-task.js'
import { me } from './server/me.js'
import { ipcMainHandle, ipcMainOn, ipcWebContentsSend } from './lib/ipc-main-handlers.js'
import { getCreateTaskInfo } from './server/tasks/get-create-task-info.js'
import { startJourney } from './server/journeys/start-journey.js'
import { endJourney } from './server/journeys/end-journey.js'
import { cancelTask, completeTask, pauseTaskInterval } from './server/tasks/end-task-interval.js'
import { checkTaskCollision } from './server/tasks/check-task-collision.js'

app.on("ready", function() {
	const mainWindow = new BrowserWindow({
		webPreferences: {
			preload: getPreloadPath()
		}
	})

	if (isDev()) {
		mainWindow.loadURL('http://localhost:5123')
	} else {
		mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'))
	}

	// handle submit form
	ipcMainOn("signInSubmit", async (data: SignInFormData) => {
		const result = await signIn(data);
		if (result.success) {
			saveToken(result.token)
		}
		ipcWebContentsSend("signInResult", mainWindow.webContents, result)
	})

	ipcMainHandle('checkToken', () => me())
	ipcMainHandle('getCreateTaskInfo', () => getCreateTaskInfo())

	ipcMainOn("startJourney", async () => {
		const result = await startJourney()
		ipcWebContentsSend("startJourneyResult", mainWindow.webContents, result)
	})
	ipcMainOn("endJourney", async (journeyId: number) => {
		const result = await endJourney(journeyId)
		ipcWebContentsSend("endJourneyResult", mainWindow.webContents, result)
	})

	ipcMainOn("checkTaskCollision", async (data) => {
		const result = await checkTaskCollision(data)
		console.log("check collision result", { result })
		if (!result.success) {
			ipcWebContentsSend("createTaskResult", mainWindow.webContents, result)
			return
		}
		if (!result.collision) {
			const result = await createTask(data);
			console.log("main createTaskSubmit", { result })
			ipcWebContentsSend("createTaskResult", mainWindow.webContents, result)
			return
		}
		ipcWebContentsSend("checkTaskCollisionResult", mainWindow.webContents, result)
	})

	ipcMainOn("createTaskSubmit", async (data: CreateTaskFormData) => {
		const result = await createTask(data);
		console.log("main createTaskSubmit", { result })
		ipcWebContentsSend("createTaskResult", mainWindow.webContents, result)
	})

	ipcMainOn("pauseTask", async (data: { taskId: Task['id'] }) => {
		console.log({ data })
		const result = await pauseTaskInterval(data.taskId)
		console.log("main pausee", { result })
		ipcWebContentsSend("pauseTaskResult", mainWindow.webContents, result)
	})

	ipcMainOn("completeTask", async (data: { taskId: Task['id'] }) => {
		console.log({ data })
		const result = await completeTask(data.taskId)
		console.log("main completeTask", { result })
		ipcWebContentsSend("completeTaskResult", mainWindow.webContents, result)
	})

	ipcMainOn("cancelTask", async (data: { taskId: Task['id'] }) => {
		console.log({ data })
		const result = await cancelTask(data.taskId)
		console.log("main cancelTask", { result })
		ipcWebContentsSend("cancelTaskResult", mainWindow.webContents, result)
	})

	createTray(mainWindow)
	handleCloseEvents(mainWindow)
})

function handleCloseEvents(mainWindow: BrowserWindow) {
	let willClose = false;

	mainWindow.on('close', (e) => {
		if (willClose) {
			return;
		}
		e.preventDefault();
		mainWindow.hide();
		if (app.dock) {
			app.dock.hide();
		}
	});

	app.on('before-quit', () => {
		willClose = true;
	});

	mainWindow.on('show', () => {
		willClose = false;
	});
}


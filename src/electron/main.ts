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
import { cancelTask, completeOtherTask, completeTask, pauseTaskInterval } from './server/tasks/end-task-interval.js'
import { checkTaskCollision } from './server/tasks/check-task-collision.js'
import { getMyTasks } from './server/tasks/get-my-tasks.js'
import { resumeTask } from './server/tasks/resume-task.js'
import { createOtherTask } from './server/other-tasks/create-other-task.js'
import { getActualJourney } from './server/journeys/get-actual-journey.js'
import { getCurrTask } from './server/tasks/get-curr-task.js'
import { todayCompletedTasks } from './server/tasks/today-completed-tasks.js'
import { captureScreens } from './lib/capture-screens.js'
import { testCredentials, uploadFile } from './lib/upload-captures.js'

app.on("ready", function() {
	const mainWindow = createWindow(
		isDev() ? "http://localhost:5123" : "/dist-react/index.html",
		{
			webPreferences: {
				preload: getPreloadPath()
			},
		})

	const toolbarWindow: BrowserWindow = createWindow(
		isDev() ? 'http://localhost:5123/toolbar.html' : '/dist-react/toolbar.html',
		{
			width: 400,
			height: 40,
			titleBarStyle: "hidden",
			frame: false,
			webPreferences: {
				contextIsolation: true,
				preload: getPreloadPath()
			}
		}, false)

	// handle submit form
	ipcMainOn("signInSubmit", async (data: SignInFormData) => {
		const result = await signIn(data);
		if (result.success) {
			saveToken(result.token)
		}
		ipcWebContentsSend("signInResult", mainWindow.webContents, result)
	})

	ipcMainHandle('checkToken', () => me())
	ipcMainHandle('getMyTasks', () => getMyTasks(["paused"]))

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
			ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
			return
		}
		ipcWebContentsSend("checkTaskCollisionResult", mainWindow.webContents, result)
	})

	ipcMainOn("createTaskSubmit", async (data: CreateTaskFormData) => {
		const result = await createTask(data);
		console.log("main createTaskSubmit", { result })
		ipcWebContentsSend("createTaskResult", mainWindow.webContents, result)
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
	})

	ipcMainOn("createOtherTaskSubmit", async (data) => {
		const result = await createOtherTask(data)
		console.log("main createOtherTaskSubmit", { result })
		ipcWebContentsSend("createOtherTaskResult", mainWindow.webContents, result)
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result.success ? { success: true, task: result.otherTask } : result)
	})

	ipcMainOn("pauseTask", async (data) => {
		const result = await pauseTaskInterval(data.taskId)
		ipcWebContentsSend("pauseTaskResult", mainWindow.webContents, result)
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
	})

	ipcMainOn("resumeTask", async (data) => {
		const result = await resumeTask(data.taskId)
		ipcWebContentsSend("resumeTaskResult", mainWindow.webContents, result)
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
	})

	ipcMainOn("completeTask", async (data) => {
		if (data.isOtherTask) {
			const result = await completeOtherTask(data.taskId)
			ipcWebContentsSend("completeOtherTaskResult", mainWindow.webContents, result)
			ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
		} else {
			const result = await completeTask(data.taskId)
			ipcWebContentsSend("completeTaskResult", mainWindow.webContents, result)
			ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
		}
	})

	ipcMainOn("cancelTask", async (data) => {
		console.log("cancel task", { data })
		const result = await cancelTask(data.taskId)
		ipcWebContentsSend("cancelTaskResult", mainWindow.webContents, result)
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
	})

	ipcMainHandle('getToolbarTask', () => getCurrTask())

	ipcMainOn("openMainWindow", () => {
		mainWindow.show()
		mainWindow.focus()
	})

	ipcMainHandle("getTodaysTasks", () => todayCompletedTasks())

	ipcMainOn("takeScreenshot", async () => {
		const result = await captureScreens()
		await testCredentials()
		await uploadFile(result[0])
		ipcWebContentsSend("screenShotResult", mainWindow.webContents, result)
	})

	createTray(mainWindow)

	app.on('before-quit', async () => {
		console.log("app before quit")
		console.log("end app before quit")
	});

	// check if there's a journey active
	mainWindow.on('close', async (e) => {
		console.log("main window close")
		e.preventDefault();
		const result = await getActualJourney()
		console.log({ result })
		if (result.success) {
			console.log({ toolbarWindow })
			if (toolbarWindow && !toolbarWindow.isDestroyed()) {
				toolbarWindow.show();
			} else {
				console.log('Toolbar window does not exist or was destroyed');
			}

			if (mainWindow && !mainWindow.isDestroyed()) {
				mainWindow.hide();
			}

			if (app.dock) {
				app.dock.hide();
			}
		} else {
			if (mainWindow && !mainWindow.isDestroyed()) {
				mainWindow.destroy();
			}
			app.quit();
		}
		console.log("end main window close")
	});

	mainWindow.on('show', () => {
		console.log("main window show")
		console.log("end main window show")
	});

	toolbarWindow.on("show", () => {
		console.log('toolbarWindow show')
	});

	toolbarWindow.on("close", (e) => {
		console.log('toolbarWindow close')
		e.preventDefault();
	});

})

function createWindow(
	urlOrFile: string,
	options: Electron.BrowserWindowConstructorOptions,
	show: boolean = true
): BrowserWindow {
	const win = new BrowserWindow({
		...options,
		show,
	})

	if (isDev()) {
		win.loadURL(urlOrFile)
	} else {
		win.loadFile(path.join(app.getAppPath(), urlOrFile))
	}

	return win
}

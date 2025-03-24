import { app, BrowserWindow } from 'electron'
import { isDev } from './lib/utils.js'
import { getMainUIPath, getPreloadPath, getToolbarUIPath } from './lib/path-resolver.js'
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
import { createWindow, hideWindow, showWindow } from './window-handlers.js'

app.on("ready", function() {
	const mainWindow = createWindow(
		isDev() ? "http://localhost:5123" : getMainUIPath(),
		{
			width: 500,
			minWidth: 500,
			height: 500,
			minHeight: 500,
			alwaysOnTop: true,
			webPreferences: {
				preload: getPreloadPath()
			},
		})

	const toolbarWindow: BrowserWindow = createWindow(
		isDev() ? 'http://localhost:5123/toolbar.html' : getToolbarUIPath(),
		{
			width: 700,
			minWidth: 600,
			height: 45,
			minHeight: 45,
			titleBarStyle: "hidden",
			frame: false,
			skipTaskbar: true,
			webPreferences: {
				contextIsolation: true,
				preload: getPreloadPath()
			}
		}, false)

	let appCanBeClose = true
	async function checkJourney() {
		const result = await getActualJourney()
		appCanBeClose = !result.success
	}
	checkJourney()

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
		if (result.success) {
			appCanBeClose = false
		}
		ipcWebContentsSend("startJourneyResult", mainWindow.webContents, result)
	})

	ipcMainOn("endJourney", async (journeyId: number) => {
		const result = await endJourney(journeyId)
		if (result.success) {
			appCanBeClose = true
			hideWindow(toolbarWindow, app)
		}
		ipcWebContentsSend("endJourneyResult", mainWindow.webContents, result)
	})

	ipcMainOn("checkTaskCollision", async (data) => {
		const result = await checkTaskCollision(data)
		if (!result.success) {
			ipcWebContentsSend("createTaskResult", mainWindow.webContents, result)
			return
		}
		if (!result.collision) {
			// Create the task directly
			const result = await createTask(data);
			hideWindow(mainWindow, app)
			showWindow(toolbarWindow, app)
			ipcWebContentsSend("createTaskResult", mainWindow.webContents, result)
			ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
			return
		}
		// There's a collision ask if wants to continue
		showWindow(mainWindow, app)
		mainWindow.focus()
		ipcWebContentsSend("checkTaskCollisionResult", mainWindow.webContents, { ...result, creationData: data })
	})

	ipcMainOn("createTaskSubmit", async (data: CreateTaskFormData) => {
		const result = await createTask(data);
		if (result.success) {
			hideWindow(mainWindow, app)
			showWindow(toolbarWindow, app)
		}
		ipcWebContentsSend("createTaskResult", mainWindow.webContents, result)
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
	})

	ipcMainOn("createOtherTaskSubmit", async (data) => {
		const result = await createOtherTask(data)
		if (result.success) {
			hideWindow(mainWindow, app)
			showWindow(toolbarWindow, app)
		}
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
		hideWindow(mainWindow, app)
		showWindow(toolbarWindow, app)
		ipcWebContentsSend("resumeTaskResult", mainWindow.webContents, result)
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
	})

	ipcMainOn("completeTask", async (data) => {
		if (data.isOtherTask) {
			const result = await completeOtherTask(data.taskId)
			ipcWebContentsSend("completeOtherTaskResult", mainWindow.webContents, result)
			ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
			ipcWebContentsSend("reloadTodaysTasks", mainWindow.webContents, await todayCompletedTasks())
		} else {
			const result = await completeTask(data.taskId)
			ipcWebContentsSend("completeTaskResult", mainWindow.webContents, result)
			ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
			ipcWebContentsSend("reloadTodaysTasks", mainWindow.webContents, await todayCompletedTasks())
		}
	})

	ipcMainOn("cancelTask", async (data) => {
		const result = await cancelTask(data.taskId)
		ipcWebContentsSend("cancelTaskResult", mainWindow.webContents, result)
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
		ipcWebContentsSend("reloadTodaysTasks", mainWindow.webContents, await todayCompletedTasks())
	})

	ipcMainHandle('getToolbarTask', () => getCurrTask())

	ipcMainOn("openMainWindow", () => {
		showWindow(mainWindow, app)
		mainWindow.focus()
	})

	ipcMainHandle("getTodaysTasks", () => todayCompletedTasks())

	ipcMainOn("takeScreenshot", async () => {
		const result = await captureScreens()
		await testCredentials()
		await uploadFile(result[0])
		ipcWebContentsSend("screenShotResult", mainWindow.webContents, result)
	})

	createTray(mainWindow, toolbarWindow)

	// check if there's a journey active
	mainWindow.on('close', (e) => {
		if (appCanBeClose) {
			app.quit()
			return;
		}
		e.preventDefault()
		mainWindow.hide()
	});

	toolbarWindow.on("close", (e) => {
		if (appCanBeClose) {
			return
		}
		e.preventDefault()
		toolbarWindow.hide()
	});
})


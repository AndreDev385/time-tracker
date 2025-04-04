import { app, BrowserWindow, powerMonitor } from 'electron'
import { platform } from "process"

import { isDev, SETTINGS } from './lib/utils.js'
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
import { getAppSettings } from './server/app-settings.js'
import { getTaskHistory } from './server/tasks/paginate-task-history.js'

app.on("ready", function() {
	const mainWindow = createWindow(
		isDev() ? "http://localhost:5123" : getMainUIPath(),
		{
			width: 1000,
			minWidth: 1000,
			height: 500,
			minHeight: 500,
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
			alwaysOnTop: true,
			webPreferences: {
				contextIsolation: true,
				preload: getPreloadPath()
			}
		}, false)

	let activeJourney: Journey | null = null;

	async function checkJourney() {
		const result = await getActualJourney()
		if (result.success) {
			activeJourney = result.journey
		}
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
			activeJourney = result.journey
		}
		ipcWebContentsSend("startJourneyResult", mainWindow.webContents, result)
		ipcWebContentsSend("startJourneyResult", toolbarWindow.webContents, result)
	})

	ipcMainOn("endJourney", async (journeyId: number) => {
		const result = await endJourney(journeyId)
		if (result.success) {
			activeJourney = null
			hideWindow(toolbarWindow, app)
		}
		ipcWebContentsSend("endJourneyResult", mainWindow.webContents, result)
		ipcWebContentsSend("endJourneyResult", toolbarWindow.webContents, result)
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
		ipcWebContentsSend("createTaskResult", mainWindow.webContents, result)
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
	})

	ipcMainOn("createOtherTaskSubmit", async (data) => {
		const result = await createOtherTask(data)
		ipcWebContentsSend("createOtherTaskResult", mainWindow.webContents, result)
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result.success ? { success: true, task: result.otherTask } : result)
	})

	ipcMainOn("pauseTask", async ({ taskId }) => {
		const result = await pauseTaskInterval({ id: taskId, comment: "" })
		ipcWebContentsSend("pauseTaskResult", mainWindow.webContents, result)
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
		ipcWebContentsSend("reloadPausedTasks", mainWindow.webContents, await getMyTasks(['paused']))
	})

	ipcMainOn("resumeTask", async (data) => {
		const result = await resumeTask(data.taskId)
		ipcWebContentsSend("resumeTaskResult", mainWindow.webContents, result)
		ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
		ipcWebContentsSend("reloadPausedTasks", mainWindow.webContents, await getMyTasks(['paused']))
	})

	ipcMainOn("completeTask", async ({ taskId, isOtherTask, comment = "" }) => {
		if (isOtherTask) {
			const result = await completeOtherTask({ id: taskId, comment })
			ipcWebContentsSend("completeOtherTaskResult", mainWindow.webContents, result)
			ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
			ipcWebContentsSend("reloadTodaysTasks", mainWindow.webContents, await todayCompletedTasks())
		} else {
			const result = await completeTask({ id: taskId, comment })
			ipcWebContentsSend("completeTaskResult", mainWindow.webContents, result)
			ipcWebContentsSend("reloadToolbarData", toolbarWindow.webContents, result)
			ipcWebContentsSend("reloadTodaysTasks", mainWindow.webContents, await todayCompletedTasks())
		}
	})

	ipcMainOn("cancelTask", async ({ taskId, comment = "" }) => {
		const result = await cancelTask({ id: taskId, comment })
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

	ipcMainOn("getTaskHistory", async ({ offset, limit, recordId }) => {
		const result = await getTaskHistory(offset, limit, recordId)
		ipcWebContentsSend("getTaskHistoryResult", mainWindow.webContents, result)
	})

	ipcMainOn("logout", () => {
		saveToken("")
		ipcWebContentsSend("logoutResult", mainWindow.webContents, undefined)
	})

	createTray(mainWindow, toolbarWindow, !!activeJourney)

	// check if there's a journey active
	mainWindow.on('close', (e) => {
		if (activeJourney) {
			e.preventDefault()
			mainWindow.hide()
		}
	});

	toolbarWindow.on("close", (e) => {
		if (activeJourney) {
			e.preventDefault()
			toolbarWindow.hide()
			return
		}
	});

	// TODO: find configured time from the backend
	let idleTimeAllowed = 300 // 300s 5min
	async function getInactiveTimeAllowed() {
		const result = await getAppSettings()

		if (!result.success) {
			idleTimeAllowed = 300
			return;
		}

		idleTimeAllowed = Number(result.settings.find(as => as.name === SETTINGS.INACTIVE_TIME_ALLOWED)!.value)
	}
	getInactiveTimeAllowed()

	setInterval(() => {
		const idleTime = powerMonitor.getSystemIdleTime()
		if (idleTime >= idleTimeAllowed) {
			// stop journey
			if (activeJourney) {
				endJourney(activeJourney.id).then(result => {
					if (result.success) {
						activeJourney = null
						ipcWebContentsSend("endJourneyResult", mainWindow.webContents, result)
						ipcWebContentsSend("endJourneyResult", toolbarWindow.webContents, result)
					}
				})
			}
		}
	}, 30_000)

	/* System shutdown */
	if (platform === "win32" || platform === "linux") {
		(powerMonitor as PowerMonitor).on('shutdown', async (e: any) => {
			if (activeJourney) {
				e.preventDefault()
				// call finish journey and tasks 
				const result = await endJourney(activeJourney.id)
				if (!result.success) {
					app.quit()
					return
				}
				activeJourney = null;
				ipcWebContentsSend("endJourneyResult", mainWindow.webContents, result)
				ipcWebContentsSend("endJourneyResult", toolbarWindow.webContents, result)
				app.quit()
			}
		});
	}

	app.on("before-quit", async (e) => {
		if (activeJourney) {
			e.preventDefault()
			// call finish journey and tasks 
			const result = await endJourney(activeJourney.id)
			if (!result.success) {
				app.quit()
				return
			}
			activeJourney = null;
			ipcWebContentsSend("endJourneyResult", mainWindow.webContents, result)
			ipcWebContentsSend("endJourneyResult", toolbarWindow.webContents, result)
			app.quit()
		}
	})
})


type PowerMonitor = typeof powerMonitor & { on(event: 'shutdown', listener: (e: unknown) => void): void }

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
import { startSession } from './server/sessions/start-session.js'
import { endSession } from './server/sessions/end-session.js'

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

	ipcMainOn("startSession", async () => {
		const result = await startSession()
		console.log({ result }, "start session server")
		ipcWebContentsSend("startSessionResult", mainWindow.webContents, result)
	})
	ipcMainOn("endSession", async (session_id: number) => {
		const result = await endSession(session_id)
		ipcWebContentsSend("endSessionResult", mainWindow.webContents, result)
	})

	// TODO: complete
	ipcMainOn("createTaskSubmit", async (data: CreateTaskFormData) => {
		const result = await createTask(data);
		console.log({ result })
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


import path from 'node:path'
import { app, BrowserWindow } from 'electron'
import { ipcMainOn, isDev } from './lib/utils.js'
import { getPreloadPath } from './lib/pathResolver.js'
import { createTray } from './tray.js'

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
	ipcMainOn("signInSubmit", (data: SignInFormData) => {
		// TODO: handle real sign in return errors if needed
		console.log({ data }, "form ipcmain")
		return { success: true }
	}, { key: "signInResult", payload: "/app" })

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


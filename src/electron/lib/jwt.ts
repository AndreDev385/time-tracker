import fs from 'fs'
import { app } from 'electron'

export function saveToken(token: string) {
	const path = app.getPath('userData')
	const data = JSON.stringify({ token })
	fs.writeFile(`${path}/token.json`, data, (err) => {
		if (err) {
			return new Error('Error saving token')
		}
	})
}

export function readToken(): { token: string } | null {
	const path = app.getPath("userData")
	try {
		return JSON.parse(fs.readFileSync(`${path}/token.json`, { encoding: 'utf-8' }))
	} catch {
		return null
	}
}

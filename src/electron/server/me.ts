import { net } from 'electron'

import { API_URL } from './config.js'
import { readToken } from '../lib/jwt.js'

export async function me() {
	const token = readToken()?.token
	const response = await net.fetch(`${API_URL}/users/me`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": token ? `Bearer ${token}` : ""
		}
	})

	const json = await response.json()
	return { success: response.ok, ...json }
}


import { net } from 'electron'
import { API_URL } from '../config.js'
import { readToken } from '../../lib/jwt.js'

export async function createTask(data: CreateTaskFormData) {
	const token = readToken()?.token
	const response = await net.fetch(`${API_URL}/tasks`, {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
			"Authorization": token ? `Bearer ${token}` : ""
		}
	})

	const json = await response.json()
	console.log({ json, ok: response.ok, status: response.status })
	return { success: response.ok, ...json }
}


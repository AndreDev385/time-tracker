import { net } from 'electron'
import { API_URL } from './config.js'
import { readToken } from '../lib/jwt.js'

export async function me(): Promise<{ user: JWTTokenData } & SuccessResponse | ErrorResponse> {
	try {
		const token = readToken()?.token
		const response = await net.fetch(`${API_URL}/users/me`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": token ? `Bearer ${token}` : ""
			}
		})

		const json = await response.json()

		if (!response.ok) {
			return { success: false, error: "Ha ocurrido un error" }
		}

		return { success: true, ...json }
	} catch (e) {
		console.log("me", { e })
		return { success: false, error: "Ha ocurrido un error" }
	}
}


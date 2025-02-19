import { net } from 'electron'
import { API_URL } from './config.js'

export async function signIn(data: SignInFormData): Promise<SignInResult> {
	const response = await net.fetch(`${API_URL}/auth/sign-in`, {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json"
		}
	})

	const json = await response.json()
	return { success: response.ok, ...json }
}


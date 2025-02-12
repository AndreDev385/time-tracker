type UnsubscribeFunction = () => void

// SignIn
type SignInFormData = {
  email: string;
  password: string;
}

type SignInResult = {
  success: true
  token: string
} | {
  success: false
  error: string
}

// CreateTask
type CreateTaskFormData = {
  user_id: string
}

type JWTToken = {
  id: numer,
  name: string,
  email: string,
  role: string,
}

interface Window {
  electron: {
    checkToken: () => Promise<{ success: boolean }>
    signInSubmit: (data: SignInFormData) => void
    signInResult: (callback: (data: SignInResult) => void) => void
    createTaskSubmit: (data: CreateTaskFormData) => void
  }
}

type EventPayloadMapping = {
  signInSubmit: SignInFormData
  signInResult: SignInResult
  createTaskSubmit: CreateTaskFormData
  checkToken: Promise<{ success: boolean }>
}

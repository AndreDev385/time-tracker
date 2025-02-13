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

type JWTTokenData = {
  id: numer,
  name: string,
  email: string,
  role: string,
}

type Session = { start_at: Date, id: number, end_at: Date | null }

interface Window {
  electron: {
    signInSubmit: (data: SignInFormData) => void
    signInResult: (callback: (data: SignInResult) => void) => void

    checkToken: () => Promise<{ success: boolean, user: JWTTokenData }>

    startSession: () => void
    startSessionResult: (callback: (data: { success: boolean, session: Omit<Session, "end_at"> }) => void) => void
    endSession: (id: number) => void
    endSessionResult: (callback: (data: { success: boolean, session: Session }) => void) => void

    createTaskSubmit: (data: CreateTaskFormData) => void
  }
}

type EventPayloadMapping = {
  signInSubmit: SignInFormData
  signInResult: SignInResult

  checkToken: Promise<{ success: boolean, user: JWTTokenData }>

  startSession: void
  startSessionResult: { success: boolean, session: Omit<Session, "end_at"> }
  endSession: number
  endSessionResult: { success: boolean, session: Session }

  createTaskSubmit: CreateTaskFormData
}

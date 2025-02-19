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
  userId: string
  projectId: number;
  businessId: number;
  taskTypeId: number;
  recordTypeId: number;
  recordId: string;
}

type JWTTokenData = {
  id: numer,
  name: string,
  email: string,
  role: string,
  assignedProjects: number[],
}

type Journey = { startAt: Date, id: number, endAt: Date | null }
type Project = { id: number, name: string }
type Business = { id: number, name: string }
type TaskType = { id: number, name: string }
type RecordType = { id: number, name: string }

type CreateTaskInfo = {
  projects: Project[]
  business: Business[]
  taskTypes: TaskType[]
  recordTypes: RecordType[]
}

type Interval = {
  startAt: Date
  endAt: Date
}

type Task = {
  id: number
  userId: number
  projectId: number
  businessId: number
  taskTypeId: number
  recordTypeId: number
  recordId: number
  intervals: Interval[]
  comment: string
  status: "pending" | "canceled" | "solved"
}

interface Window {
  electron: {
    signInSubmit: (data: SignInFormData) => void
    signInResult: (callback: (data: SignInResult) => void) => void

    checkToken: () => Promise<{ success: boolean, user: JWTTokenData }>

    startJourney: () => void
    startJourneyResult: (callback: (data: { success: boolean, journey: Omit<Journey, "endAt"> }) => void) => void
    endJourney: (id: number) => void
    endJourneyResult: (callback: (data: { success: boolean, journey: Journey }) => void) => void

    getCreateTaskInfo: () => Promse<CreateTaskInfo>

    createTaskSubmit: (data: CreateTaskFormData) => void
    createTaskResult: (callback: (data: { success: boolean, task: Task }) => void) => void

    pauseTask: ({ taskId }: { taskId: Task['id'] }) => void
    pauseTaskResult: (callback: (data: { success: boolean, task: Task }) => void) => void
  }
}

type EventPayloadMapping = {
  signInSubmit: SignInFormData
  signInResult: SignInResult

  checkToken: Promise<{ success: boolean, user: JWTTokenData }>

  startJourney: void
  startJourneyResult: { success: boolean, journey: Omit<Journey, "endAt"> }
  endJourney: number
  endJourneyResult: { success: boolean, journey: Journey }

  getCreateTaskInfo: Promise<CreateTaskInfo>

  createTaskSubmit: CreateTaskFormData
  createTaskResult: { success: boolean, task: Task }

  pauseTask: { taskId: Task['id'] }
  pauseTaskResult: { success: boolean, task: Task }
}

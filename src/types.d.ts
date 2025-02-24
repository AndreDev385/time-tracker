type SuccessResponse = { success: true }
type ErrorResponse = { success: false, error: string }

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
  endAt: Date | null
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

    checkToken: () => Promise<({ user: JWTTokenData } & SuccessResponse) | ErrorResponse>
    startJourney: () => void
    startJourneyResult: (callback: (data: { journey: Journey } & SuccessResponse | ErrorResponse) => void) => void
    endJourney: (id: number) => void
    endJourneyResult: (
      callback: (data: { journey: Journey } & SuccessResponse | ErrorResponse) => void
    ) => void

    getCreateTaskInfo: () => Promise<(CreateTaskInfo & SuccessResponse) | ErrorResponse>

    checkTaskCollision: (data: CreateTaskFormData) => void;
    checkTaskCollisionResult: (
      callback: (data: { collision: boolean } & SuccessResponse) => void
    ) => void,

    createTaskSubmit: (data: CreateTaskFormData) => void
    createTaskResult: (
      callback: (data: { task: Task } & SuccessResponse | ErrorResponse) => void
    ) => void

    pauseTask: ({ taskId }: { taskId: Task['id'] }) => void
    pauseTaskResult: (
      callback: (data: { task: Task } & SuccessResponse | ErrorResponse) => void
    ) => void

    completeTask: ({ taskId }: { taskId: Task['id'] }) => void
    completeTaskResult: (
      callback: (data: { task: Task } & SuccessResponse | ErrorResponse) => void
    ) => void

    cancelTask: ({ taskId }: { taskId: Task['id'] }) => void
    cancelTaskResult: (
      callback: (data: { task: Task } & SuccessResponse | ErrorResponse) => void
    ) => void
  }
}

type EventPayloadMapping = {
  signInSubmit: SignInFormData
  signInResult: SignInResult

  checkToken: Promise<({ user: JWTTokenData } & SuccessResponse) | ErrorResponse>

  startJourney: void
  startJourneyResult: { journey: Journey } & SuccessResponse | ErrorResponse
  endJourney: number
  endJourneyResult: { journey: Journey } & SuccessResponse | ErrorResponse

  getCreateTaskInfo: Promise<(CreateTaskInfo & SuccessResponse) | ErrorResponse>

  checkTaskCollision: CreateTaskFormData
  checkTaskCollisionResult: { collision: boolean } & SuccessResponse

  createTaskSubmit: CreateTaskFormData
  createTaskResult: { task: Task } & SuccessResponse | ErrorResponse

  pauseTask: { taskId: Task['id'] }
  pauseTaskResult: { task: Task } & SuccessResponse | ErrorResponse

  cancelTask: { taskId: Task['id'] }
  cancelTaskResult: { task: Task } & SuccessResponse | ErrorResponse

  completeTask: { taskId: Task['id'] }
  completeTaskResult: { task: Task } & SuccessResponse | ErrorResponse
}

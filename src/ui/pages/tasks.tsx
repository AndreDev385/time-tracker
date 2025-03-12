/* eslint-disable react-hooks/exhaustive-deps */
import React from "react"
import { displayMessage } from "../lib/utils"
import { StepsTaskForm } from "../components/tasks/steps-task-form"
import { Loader2 } from "lucide-react"
import { LocalStorage } from "../storage"
import { useNavigate } from "react-router"
import { OtherTaskForm } from "../components/tasks/other-task-form"
import { ROUTES } from "../main"
import { DropdownCard } from "../components/shared/dropdown"
import { PendingTask } from "../components/tasks/pending-task"
import { isTask } from "../lib/check-task-type"

export function TasksPage() {
  const navigate = useNavigate()

  const [loading, setLoading] = React.useState(true)
  const [createTaskInfo, setCreateTaskInfo] = React.useState<CreateTaskInfo>()

  const [collisionModal, setCollisionModal] = React.useState({
    open: false,
  })

  const [pausedTasks, setPausedTasks] = React.useState<Task[]>([])
  const [user, setUser] = React.useState<JWTTokenData>();

  /* Task Form */
  const ONE_ASSIGNED_PROJECT = React.useMemo(() => {
    return user?.assignedProjects ? user.assignedProjects.length === 1 : false;
  }, [user])

  const INITIAL_FORM_STATE: FormState = React.useMemo(() => ({
    step: ONE_ASSIGNED_PROJECT ? 1 : 0,
    recordId: "",
    selectedProject: null,
    selectedBusiness: null,
    selectedTaskType: null,
    selectedRecordType: null,
  }), [ONE_ASSIGNED_PROJECT])

  const [formState, setFormState] = React.useState(INITIAL_FORM_STATE)

  function onFormStateChange(name: keyof typeof INITIAL_FORM_STATE, value: FormState[keyof FormState]) {
    setFormState(prev => ({ ...prev, [name]: value }))
  }
  /**/

  /* Other Task Form */
  const [otherTaskForm, setOtherTaskForm] = React.useState<OtherTaskFormState>(
    OTHER_TASK_FORM_INITIAL_STATE
  )
  /**/

  React.useEffect(() => {
    const curr = LocalStorage().getItem("currTask")
    if (curr) {
      if (isTask(curr)) {
        navigate(ROUTES.inProgressTask, { state: { task: curr } })
      } else {
        navigate(ROUTES.inProgressOtherTask, { state: { otherTask: curr } })
      }
    }
  }, [])

  React.useEffect(function loadMyTasks() {
    async function getMyTasks() {
      const data = await window.electron.getMyTasks()
      console.log({ data })
      if (data.success) {
        setPausedTasks(data.tasks)
      }
    }
    getMyTasks()
  }, [])

  React.useEffect(function loadUser() {
    setFormState(prev => ({
      ...prev, selectedProject: ONE_ASSIGNED_PROJECT ? (user as JWTTokenData).assignedProjects![0] : null,
      step: ONE_ASSIGNED_PROJECT ? 1 : 0
    }))
  }, [user, ONE_ASSIGNED_PROJECT])

  React.useEffect(function loadCreateTaskInfo() {
    async function loadCreateTaskInfo() {
      const data = await window.electron.getCreateTaskInfo()
      if (!data.success) {
        displayMessage(data.error, "error")
        return;
      }
      setCreateTaskInfo(data)
      setUser(LocalStorage().getItem("user") as JWTTokenData)
      setLoading(false)
    }
    loadCreateTaskInfo()
  }, [])

  function handleSubmitTask(createTaskFormData: CreateTaskFormData, confirmation: boolean = false) {
    if (confirmation) {
      window.electron.createTaskSubmit(createTaskFormData)
    } else {
      window.electron.checkTaskCollision(createTaskFormData)
    }
    setLoading(true)
  }

  React.useEffect(function createTaskResult() {
    return window.electron.createTaskResult((result) => {
      setLoading(false)
      if (result.success) {
        LocalStorage().setItem("currTask", result.task)
        navigate(ROUTES.inProgressTask, { state: { task: result.task } })
      } else {
        displayMessage(result.error, "error")
      }
    })
  }, [])


  React.useEffect(function createOtherTaskResult() {
    return window.electron.createOtherTaskResult((result) => {
      setLoading(false)
      if (result.success) {
        LocalStorage().setItem("currTask", result.otherTask)
        navigate(ROUTES.inProgressOtherTask, { state: { otherTask: result.otherTask } })
      } else {
        displayMessage(result.error, "error")
      }
    })
  }, [])

  React.useEffect(function checkTaskCollisionResponse() {
    return window.electron.checkTaskCollisionResult((data) => {
      setLoading(false)
      if (data.success) {
        setCollisionModal({ open: data.collision })
      }
    })
  }, [])

  function handleResumeTask(taskId: Task['id'], isOtherTask?: boolean) {
    window.electron.resumeTask({ taskId, isOtherTask: isOtherTask ?? false })
    setLoading(true)
  }

  React.useEffect(function resumeTaskResponse() {
    return window.electron.resumeTaskResult((data) => {
      setLoading(false)
      if (data.success) {
        navigate(ROUTES.inProgressTask, { state: { task: data.task } })
      } else {
        displayMessage(data.error, "error")
      }
    })
  }, [])

  if (loading) {
    return (<div className="flex flex-col items-center justify-center">
      <Loader2 className="animate-spin size-10" />
    </div>)
  }
  // TODO: handle error
  if (!createTaskInfo || !user) return "Ha ocurrido un error"
  return (
    <>
      {
        otherTaskForm.show ? (
          <OtherTaskForm
            loading={loading}
            setLoading={setLoading}
            initialState={OTHER_TASK_FORM_INITIAL_STATE}
            otherTaskForm={otherTaskForm}
            setOtherTaskForm={setOtherTaskForm}
            options={createTaskInfo.otherTaskOptions}
            userId={user.id}
          />
        ) : (
          <StepsTaskForm
            showOtherTaskForm={() => setOtherTaskForm(prev => ({ ...prev, show: true }))}
            formState={formState}
            onFormStateChange={onFormStateChange}
            handleSubmitTask={handleSubmitTask}
            collisionModal={collisionModal}
            setCollisionModal={setCollisionModal}
            user={user!}
            createTaskInfo={createTaskInfo!}
          />
        )
      }
      {/* tasks list */}
      {pausedTasks.length > 0 ?
        (
          <DropdownCard title="Pendientes">
            {pausedTasks.map(task => (
              <PendingTask
                key={task.id}
                task={task}
                loading={loading}
                handleResumeTask={handleResumeTask}
              />
            ))}
          </DropdownCard>
        ) : null}
    </>
  )
}

export type FormState = {
  step: number
  recordId: string
  selectedProject: Project['id'] | null
  selectedBusiness: Business['id'] | null
  selectedTaskType: TaskType['id'] | null
  selectedRecordType: RecordType['id'] | null
}

export type OtherTaskFormState = {
  label: string
  defaultOption: number | undefined
  comment: string
  show: boolean
  custom: boolean
}

const OTHER_TASK_FORM_INITIAL_STATE: OtherTaskFormState = {
  label: "",
  show: false,
  defaultOption: undefined,
  comment: "",
  custom: false
}

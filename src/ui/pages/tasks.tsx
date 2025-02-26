import React from "react"
import { displayMessage } from "../lib/utils"
import { StepsTaskForm } from "../components/steps-task-form"
import { CheckCircleIcon, Loader2 } from "lucide-react"
import { Button } from "../components/shared/button"
import { PauseIcon, PlayIcon, StopIcon } from "@heroicons/react/24/solid"
import { LocalStorage } from "../storage"
import { Textarea } from "../components/shared/textarea"

export function TasksPage() {
  const [loading, setLoading] = React.useState(false)
  const [createTaskInfo, setCreateTaskInfo] = React.useState<CreateTaskInfo>()

  const [collisionModal, setCollisionModal] = React.useState({
    open: false,
  })

  const [pausedTasks, setPausedTasks] = React.useState<Task[]>([])

  const [user, setUser] = React.useState<JWTTokenData>();
  const [task, setTask] = React.useState<Task | null>(null)
  const [comment, setComment] = React.useState<{ action: "" | "solved" | "canceled", show: boolean, value: string }>({
    action: "",
    show: false,
    value: "",
  })

  /* Form */
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

  async function getMyTasks() {
    const data = await window.electron.getMyTasks()
    console.log({ data })
    if (data.success) {
      setPausedTasks(data.tasks)
    }
  }

  React.useEffect(function loadMyTasks() {
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
    }
    loadCreateTaskInfo()
    setUser(LocalStorage().getItem("user") as JWTTokenData)
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
    window.electron.createTaskResult((result) => {
      setLoading(false)
      if (result.success) {
        setTask(result.task)
        setFormState({ ...INITIAL_FORM_STATE, selectedProject: formState.selectedProject })
      } else {
        displayMessage(result.error, "error")
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [INITIAL_FORM_STATE])

  React.useEffect(function checkTaskCollisionResponse() {
    window.electron.checkTaskCollisionResult((data) => {
      setLoading(false)
      if (data.success) {
        setCollisionModal({ open: true })
      }
    })
  }, [])

  function handlePauseTask(taskId: Task['id']) {
    window.electron.pauseTask({ taskId })
    setLoading(true)
  }

  React.useEffect(function pauseTaskResponse() {
    window.electron.pauseTaskResult((data) => {
      setLoading(false)
      if (data.success) {
        setTask(null)
        displayMessage("La tarea se ha pausado", "success")
      } else {
        displayMessage(data.error, "error")
      }
    })
  }, [])

  function handleResumeTask(taskId: Task['id']) {
    window.electron.resumeTask({ taskId })
    setLoading(true)
  }

  React.useEffect(function resumeTaskResponse() {
    window.electron.resumeTaskResult((data) => {
      setLoading(false)
      if (data.success) {
        setTask(data.task)
        setComment({
          show: false,
          action: "",
          value: "",
        })
        displayMessage("La tarea se ha reanudado", "success")
      } else {
        displayMessage(data.error, "error")
      }
    })
  }, [])

  function handleCompleteTask(taskId: Task['id'], comment: string) {
    window.electron.completeTask({ taskId, comment })
    setLoading(true)
  }

  React.useEffect(function completeTaskResponse() {
    window.electron.completeTaskResult((data) => {
      setLoading(false)
      if (data.success) {
        setTask(null)
        setComment({
          show: false,
          action: "",
          value: "",
        })
        displayMessage("La tarea se ha completado", "success")
      } else {
        displayMessage(data.error, "error")
      }
    })
  }, [])

  function handleCancelTask(taskId: Task['id'], comment: string) {
    window.electron.cancelTask({ taskId, comment })
    setLoading(true)
  }

  React.useEffect(function cancelTaskResponse() {
    window.electron.cancelTaskResult((data) => {
      setLoading(false)
      if (data.success) {
        setTask(null)
        setComment({
          show: false,
          action: "",
          value: "",
        })
        displayMessage("La tarea se ha cancelado", "success")
      } else {
        displayMessage(data.error, "error")
      }
    })
  }, [])

  if (!createTaskInfo || !user) return "Ha ocurrido un error"

  if (loading) {
    return (<div className="flex flex-col items-center justify-center">
      <Loader2 className="animate-spin size-10" />
    </div>)
  }

  if (task) {
    return (
      <>
        {
          comment.show ? (
            <div className="flex flex-col gap-4">
              <Textarea
                value={comment.value}
                onChange={(e) => setComment(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Ingresa cualquier informacion adicional con respecto al expediente"
              />
              <div className="flex justify-end">
                <Button
                  onMouseDown={() => {
                    if (comment.action === "solved") {
                      handleCompleteTask(task.id, comment.value)
                    }
                    if (comment.action === "canceled") {
                      handleCancelTask(task.id, comment.value)
                    }
                  }}
                >Guardar</Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between p-4 border border-gray-300 rounded-lg shadow-lg items-center">
              <div>
                <h1>Expediente: {task.recordId}</h1>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="icon"
                  className="rounded-lg bg-green-500 hover:bg-green-400/90"
                  onMouseDown={() => setComment({
                    show: true,
                    action: "solved",
                    value: "",
                  })}
                >
                  <CheckCircleIcon className="size-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-lg border-gray-400"
                  onMouseDown={() => handlePauseTask(task.id)}
                >
                  <PauseIcon className="size-6" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-lg"
                  onMouseDown={() => setComment({
                    show: true,
                    action: "canceled",
                    value: "",
                  })}
                >
                  <StopIcon className="size-6" />
                </Button>
              </div>
            </div>
          )
        }
      </>
    )
  }

  return (
    <>
      <StepsTaskForm
        formState={formState}
        onFormStateChange={onFormStateChange}
        ONE_ASSIGNED_PROJECT={ONE_ASSIGNED_PROJECT}
        handleSubmitTask={handleSubmitTask}
        collisionModal={collisionModal}
        setCollisionModal={setCollisionModal}
        user={user!}
        projects={createTaskInfo?.projects ?? []}
        businesses={createTaskInfo?.business ?? []}
        taskTypes={createTaskInfo?.taskTypes ?? []}
        recordTypes={createTaskInfo?.recordTypes ?? []}
      />
      {/* tasks list */}
      {
        pausedTasks.map(task => (
          <div key={task.id} className="flex justify-between p-4 border border-gray-300 rounded-lg shadow-lg items-center">
            <div>
              <h1>Expediente: {task.recordId}</h1>
            </div>
            <Button
              variant="default"
              size="icon"
              className="rounded-lg bg-green-500 hover:bg-green-400/90"
              onMouseDown={() => handleResumeTask(task.id)}
            >
              <PlayIcon className="size-6" />
            </Button>
          </div>
        ))
      }
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

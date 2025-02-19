import React from "react"
import invariant from 'tiny-invariant'

import { LocalStorage } from "../storage"
import { useNavigate } from "react-router"
import { displayMessage } from "../lib/utils"
import { Separator } from "../components/shared/separator"
import { JourneyTimer } from "../components/journey-timer"
import { StepsTaskForm } from "../components/steps-task-form"
import { Loader2 } from "lucide-react"
import { Button } from "../components/shared/button"
import { PauseIcon } from "@heroicons/react/24/solid"

export function TasksPage() {
  const navigate = useNavigate()

  const [loading, setLoading] = React.useState(false)
  const [journey, setJourney] = React.useState<{ id: Journey['id'], startAt: Journey['startAt'] }>()
  const [createTaskInfo, setCreateTaskInfo] = React.useState<CreateTaskInfo>()
  const [user, setUser] = React.useState<JWTTokenData>()

  const [task, setTask] = React.useState<Task | null>(null)

  React.useEffect(function createTaskResult() {
    window.electron.createTaskResult((result) => {
      setLoading(false)
      console.log({ data: result }, "RESULT")
      if (result.success) {
        setTask(result.task)
      } else {
        displayMessage(result.error, "error")
      }
    })
  }, [])

  React.useEffect(function loadJourney() {
    const journey = LocalStorage().getItem("journey")
    if (!journey) {
      navigate("/journey")
      return
    }
    setJourney({ id: journey.id, startAt: new Date(journey.startAt) })

    async function loadCreateTaskInfo() {
      const data = await window.electron.getCreateTaskInfo()
      console.log({ createTaskInfo: data })
      if (!data.success) {
        displayMessage(data.error, "error")
        return;
      }
      setCreateTaskInfo(data)
    }
    loadCreateTaskInfo()
    setUser(LocalStorage().getItem("user") as JWTTokenData)
  }, [navigate])


  function handleStopJourney() {
    invariant(journey, "journey is not defined")
    window.electron.endJourney(journey.id)
  }

  React.useEffect(function stopJourneyResponse() {
    window.electron.endJourneyResult((data) => {
      if (data.success) {
        navigate("/journey")
      } else {
        displayMessage(data.error, "error")
      }
    })
  }, [navigate])

  function handleSubmitTask(createTaskFormData: CreateTaskFormData) {
    window.electron.createTaskSubmit(createTaskFormData)
    setLoading(true)
  }

  function handlePauseTask(taskId: Task['id']) {
    window.electron.pauseTask({ taskId })
    setLoading(true)
  }

  React.useEffect(function pauseTaskResponse() {
    window.electron.pauseTaskResult((data) => {
      console.log("Pause response", { data })
      setLoading(false)
      if (data.success) {
        setTask(null)
        displayMessage("La tarea se ha pausado", "success")
      } else {
        displayMessage(data.error, "error")
      }
    })
  }, [])

  function render() {
    if (loading) {
      return (<div className="flex flex-col items-center justify-center">
        <Loader2 className="animate-spin size-10" />
      </div>)
    }

    if (task) {
      return (
        <div className="flex justify-between p-4 border border-gray-300 rounded-lg shadow-lg items-center">
          <div>
            <h1>Trabajando en - Expediente: {task.recordId}</h1>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-lg"
            onMouseDown={() => handlePauseTask(task.id)}
          >
            <PauseIcon className="size-6" />
          </Button>
        </div>
      )
    }

    return (
      <StepsTaskForm
        handleSubmitTask={handleSubmitTask}
        user={user!}
        projects={createTaskInfo?.projects ?? []}
        businesses={createTaskInfo?.business ?? []}
        taskTypes={createTaskInfo?.taskTypes ?? []}
        recordTypes={createTaskInfo?.recordTypes ?? []}
      />
    )
  }

  // TODO: handle error
  if (!journey || !createTaskInfo || !user) return
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="space-y-6 max-w-md w-full">
        <JourneyTimer journey={journey} handleStopJourney={handleStopJourney} />
        <Separator />
        {render()}
      </div>
    </div>
  )
}

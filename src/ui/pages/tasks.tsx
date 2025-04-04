/* eslint-disable react-hooks/exhaustive-deps */
import React from "react"
import { displayMessage } from "../lib/utils"
import { Loader2 } from "lucide-react"
import { LocalStorage } from "../storage"
import { useNavigate } from "react-router"
import { ROUTES } from "../main"
import { isTask } from "../lib/check-task-type"
import { TasksForm } from "../components/tasks/form"
import { CollisionModal } from "../components/tasks/collision-modal"

export function TasksPage() {
  const navigate = useNavigate()

  const [loading, setLoading] = React.useState(false)
  const [collisionModal, setCollisionModal] = React.useState<{
    open: boolean,
    data: CreateTaskFormData | null,
  }>({
    open: false,
    data: null
  })


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

  React.useEffect(function createTaskResult() {
    return window.electron.createTaskResult((result) => {
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
      if (result.success) {
        LocalStorage().setItem("currTask", result.otherTask)
        navigate(ROUTES.inProgressOtherTask, { state: { otherTask: result.otherTask } })
      } else {
        displayMessage(result.error, "error")
      }
    })
  }, [])

  React.useEffect(function checkTaskCollision() {
    // TODO: Append submit task data to continue collision
    return window.electron.checkTaskCollisionResult((data) => {
      if (data.success) {
        setCollisionModal({ open: data.collision, data: data.creationData })
      }
    })
  }, [])


  React.useEffect(function resumeTaskResponse() {
    return window.electron.resumeTaskResult((data) => {
      if (data.success) {
        navigate(ROUTES.inProgressTask, { state: { task: data.task } })
      } else {
        displayMessage(data.error, "error")
      }
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (<div className="flex flex-col items-center justify-center">
      <Loader2 className="animate-spin size-10" />
    </div>)
  }
  // TODO: handle error
  return (
    <>
      {/* TODO: Handle the continue collision in the ipc main */}
      <CollisionModal
        state={collisionModal}
        setState={(v) => setCollisionModal(prev => ({ ...prev, open: v.open }))}
        submit={() => window.electron.createTaskSubmit(collisionModal.data!)}
      />
      <div className="flex flex-col gap-2 border border-gray-300 rounded-lg p-4">
        <TasksForm />
      </div>
    </>
  )
}


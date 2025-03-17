/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "../components/shared/button"
import React from "react"
import { displayMessage } from "../lib/utils"
import { useLocation, useNavigate } from "react-router"
import { ActiveTask } from "../components/tasks/active-task"
import { ROUTES } from "../main"
import { LocalStorage } from "../storage"
import { Input } from "../components/shared/input"

export function InProgressTask() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const task = state?.task as Task

  const [loading, setLoading] = React.useState(false)
  const [comment, setComment] = React.useState<{ action: "" | "solved" | "canceled", show: boolean, value: string }>({
    action: "",
    show: false,
    value: "",
  })

  function handlePauseTask(taskId: Task['id']) {
    window.electron.pauseTask({ taskId })
    setLoading(true)
  }

  React.useEffect(function pauseTaskResponse() {
    return window.electron.pauseTaskResult((data) => {
      setLoading(false)
      if (data.success) {
        displayMessage("La tarea se ha pausado", "success")
        LocalStorage().removeItem("currTask")
        navigate(ROUTES.journey)
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
    return window.electron.completeTaskResult((data) => {
      setLoading(false)
      if (data.success) {
        displayMessage("La tarea se ha completado", "success")
        LocalStorage().removeItem("currTask")
        navigate(ROUTES.journey)
      } else {
        displayMessage(data.error, "error")
      }
    })
  }, [])

  function handleCancelTask(taskId: Task['id'], comment: string) {
    window.electron.cancelTask({ taskId, comment })
    setLoading(true)
  }

  React.useEffect(function cancelTaskResult() {
    return window.electron.cancelTaskResult((data) => {
      setLoading(false)
      if (data.success) {
        displayMessage("La tarea se ha cancelado", "success")
        LocalStorage().removeItem("currTask")
        navigate(ROUTES.journey)
      } else {
        displayMessage(data.error, "error")
      }
    })
  }, [])

  return comment.show ? (
    <div className="flex gap-4">
      <Input
        value={comment.value}
        onChange={(e) => setComment(prev => ({ ...prev, value: e.target.value }))}
        placeholder="Observaciones"
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
    <div className="border border-gray-300 rounded-lg p-4">
      <ActiveTask task={task!} loading={loading} setComment={setComment} handlePauseTask={handlePauseTask} />
    </div>
  )
}

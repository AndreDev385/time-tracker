import React from "react"
import { displayMessage } from "../lib/utils"
import { useLocation, useNavigate } from "react-router"
import { ActiveOtherTask } from "../components/tasks/active-other-task"
import { ROUTES } from "../main"

export function InProgressOtherTask() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const otherTask = state?.otherTask as OtherTask

  const [loading, setLoading] = React.useState(false)

  function handleCompleteTask(taskId: Task['id']) {
    window.electron.completeTask({ taskId, isOtherTask: true })
    setLoading(true)
  }

  React.useEffect(function completeTaskResponse() {
    return window.electron.completeOtherTaskResult((data) => {
      setLoading(false)
      if (data.success) {
        displayMessage("La tarea se ha completado", "success")
        navigate(ROUTES.journey)
      } else {
        displayMessage(data.error, "error")
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ActiveOtherTask
      otherTask={otherTask}
      loading={loading}
      handleCompleteTask={handleCompleteTask}
    />
  )
}

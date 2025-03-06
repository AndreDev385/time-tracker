import React from "react"
import { displayMessage } from "../lib/utils"
import { useLocation, useNavigate } from "react-router"
import { ActiveOtherTask } from "../components/tasks/active-other-task"
import { ROUTES } from "../main"
import { LocalStorage } from "../storage"

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
        LocalStorage().removeItem("currTask")
        navigate(ROUTES.journey)
      } else {
        displayMessage(data.error, "error")
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (

    <div className="border border-gray-300 rounded-lg p-4">
      <ActiveOtherTask
        otherTask={otherTask}
        loading={loading}
        handleCompleteTask={handleCompleteTask}
      />
    </div>
  )
}

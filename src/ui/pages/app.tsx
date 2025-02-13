import React from "react"
import { Button } from "../components/shared/button"
import { CreateTaskForm } from "../components/create-task-form"
import { Separator } from "../components/shared/separator"
import { StopIcon } from "@heroicons/react/24/solid"
import { formatDistanceHHMMSS } from "../lib/utils"

export function AppPage() {
  const [currentTask, setCurrentTask] = React.useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [sessionStartAt, setSessionStartAt] = React.useState<Date | null>()
  const [currentTime, setCurrentTime] = React.useState(new Date())

  type Task = {
    empresa: string
    tipoDeTarea: string
    expediente: string
  }

  React.useEffect(function timer() {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, []);

  const handleStopSession = () => {
    setSessionStartAt(null)
    setCurrentTask(null)
  }


  const handleSubmitTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    //const formData = new FormData(e.currentTarget);
    //const data = Object.fromEntries(formData);
    //setCurrentTask({
    //  empresa: String(data.empresa),
    //  tipoDeTarea: String(data.tipoDeTarea),
    //  expediente: String(data.expediente),
    //})
    window.electron.createTaskSubmit({
      user_id: "1"
    })
  }

  const handleUpdateTask = (action: string) => {
    // Here you would implement the logic for updating the task based on the selected action
    console.log(`Task updated: ${action}`)
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 w-full max-w-md">
        {!sessionStartAt ? (
          "x"
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between p-4 border border-gray-300 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold">{formatDistanceHHMMSS(sessionStartAt, currentTime)}</h2>
              <Button
                onClick={handleStopSession}
                variant="destructive"
                className="rounded-lg p-4"
              >
                <StopIcon className="size-6" />
              </Button>
            </div>
            <Separator />

            {currentTask ? (
              <div className="bg-indigo-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-indigo-800">Tarea Actual</h3>
                <p>
                  <span className="font-medium">Empresa:</span> {currentTask.empresa}
                </p>
                <p>
                  <span className="font-medium">Tipo de tarea:</span> {currentTask.tipoDeTarea}
                </p>
                <p>
                  <span className="font-medium">Expediente:</span> {currentTask.expediente}
                </p>
                <Button
                  className="w-full rounded-lg flex items-center justify-center"
                  onClick={() => setIsModalOpen(true)}
                >
                  Actualizar Tarea
                </Button>
              </div>
            ) : (
              <CreateTaskForm handleSubmitTask={handleSubmitTask} />
            )}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-80">
              <h3 className="text-lg font-semibold mb-4">Actualizar Tarea</h3>
              <div className="space-y-2">
                <Button
                  className="w-full rounded-lg"
                  onClick={() => handleUpdateTask("Completar")}
                  variant="success"
                >
                  Completar
                </Button>
                <Button
                  className="w-full rounded-lg"
                  onClick={() => handleUpdateTask("Pausar")}
                  variant="info"
                >
                  Pausar
                </Button>
                <Button
                  className="w-full rounded-lg"
                  onClick={() => handleUpdateTask("Marcar como no completada")}
                  variant="destructive"
                >
                  Marcar como no completada
                </Button>
              </div>
              <Separator className="my-4" />
              <Button
                className="w-full rounded-lg"
                onClick={() => setIsModalOpen(false)}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


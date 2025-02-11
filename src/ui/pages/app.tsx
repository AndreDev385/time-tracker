import React from "react"
import { Button } from "../components/shared/button"
import { CreateTaskForm } from "../components/create-task-form"
import { Play } from "lucide-react"
import { Separator } from "../components/shared/separator"

export function AppPage() {
  const [isSessionStarted, setIsSessionStarted] = React.useState(false)
  const [elapsedTime, setElapsedTime] = React.useState(0)
  const [currentTask, setCurrentTask] = React.useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  interface Task {
    empresa: string
    tipoDeTarea: string
    expediente: string
  }

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSessionStarted) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isSessionStarted])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  const handleStartSession = () => {
    setIsSessionStarted(true)
  }

  const handleStopSession = () => {
    setIsSessionStarted(false)
    setElapsedTime(0)
    setCurrentTask(null)
  }


  const handleSubmitTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    setCurrentTask({
      empresa: String(data.empresa),
      tipoDeTarea: String(data.tipoDeTarea),
      expediente: String(data.expediente),
    })
  }

  const handleUpdateTask = (action: string) => {
    // Here you would implement the logic for updating the task based on the selected action
    console.log(`Task updated: ${action}`)
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {!isSessionStarted ? (
          <>
            <Button
              onClick={handleStartSession}
              variant="default"
              className="w-full px-8 flex items-center rounded-full py-6 justify-center text-xl font-semibold"
            >
              <Play size={24} />
              Comenzar Sesión
            </Button>
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-indigo-600">{formatTime(elapsedTime)}</h2>
              <p className="text-gray-600 mt-2">Tiempo transcurrido</p>
            </div>

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
                  className="w-full rounded-full flex items-center justify-center"
                  onClick={() => setIsModalOpen(true)}
                >
                  Actualizar Tarea
                </Button>
              </div>
            ) : (
              <CreateTaskForm handleSubmitTask={handleSubmitTask} />
            )}
            <Separator />
            <Button
              onClick={handleStopSession}
              variant="destructive"
              className="rounded-full w-full flex items-center justify-center text-lg"
            >
              Detener Sesión
            </Button>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-80">
              <h3 className="text-lg font-semibold mb-4">Actualizar Tarea</h3>
              <div className="space-y-2">
                <Button
                  className="w-full rounded-full"
                  onClick={() => handleUpdateTask("Completar")}
                  variant="success"
                >
                  Completar
                </Button>
                <Button
                  className="w-full rounded-full"
                  onClick={() => handleUpdateTask("Pausar")}
                  variant="info"
                >
                  Pausar
                </Button>
                <Button
                  className="w-full rounded-full"
                  onClick={() => handleUpdateTask("Marcar como no completada")}
                  variant="destructive"
                >
                  Marcar como no completada
                </Button>
              </div>
              <Separator className="my-4" />
              <Button
                className="w-full rounded-full"
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


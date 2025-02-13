import React from "react"
import { } from 'date-fns'
import { StopIcon } from "@heroicons/react/24/solid"
import invariant from 'tiny-invariant'

import { LocalStorage } from "../storage"
import { useNavigate } from "react-router"
import { displayMessage, formatDistanceHHMMSS } from "../lib/utils"
import { Button } from "../components/shared/button"
import { Separator } from "../components/shared/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/shared/dialog"
import { DialogClose } from "@radix-ui/react-dialog"

export function TasksPage() {
  const navigate = useNavigate()

  const [session, setSession] = React.useState<{ id: number, start_at: Date }>()
  const [currentTime, setCurrentTime] = React.useState(new Date())

  React.useEffect(function loadSession() {
    const session = LocalStorage().getItem("session")
    console.log({ session })
    if (!session) {
      navigate("/session")
      return
    }
    setSession({ id: session.id, start_at: new Date(session.start_at) })
  }, [navigate])

  React.useEffect(function timer() {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, []);

  function handleStopSession() {
    invariant(session, "session is not defined")
    window.electron.endSession(session.id)
  }

  React.useEffect(function stepSessionResponse() {
    window.electron.endSessionResult((data) => {
      if (data.success) {
        navigate("/session")
      } else {
        displayMessage("No se pudo finalizar el temporizador", "error")
      }
    })
  }, [navigate])

  if (!session) return
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="space-y-6 max-w-md w-full">
        <div className="flex justify-between p-4 border border-gray-300 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">{formatDistanceHHMMSS(session?.start_at, currentTime)}</h2>
          <Dialog>
            <DialogTrigger>
              <Button
                variant="destructive"
                className="rounded-lg p-4"
              >
                <StopIcon className="size-6" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Estás seguro de finalizar el temporizador?</DialogTitle>
                <DialogDescription>
                  <p>
                    Asegúrate de completar todas tus tareas antes de finalizar el temporizador.
                  </p>
                  <p>
                    Esta acción no se puede deshacer.
                  </p>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    onClick={() => handleStopSession()}
                  >
                    Finalizar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Separator />
      </div>
    </div>
  )
}

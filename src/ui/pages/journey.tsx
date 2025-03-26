import React from "react";
import { Loader2 } from "lucide-react";
import { Outlet } from "react-router";
import invariant from "tiny-invariant";
import { PlayIcon } from "@heroicons/react/24/solid";

import { Button } from "../components/shared/button";
import { LocalStorage } from "../storage";
import { displayMessage } from "../lib/utils";
import { JourneyTimer } from "../components/tasks/journey-timer";
import { Separator } from "../components/shared/separator";
import { FinishedTask } from "../components/tasks/finished-task";
import { FinishedOtherTask } from "../components/tasks/finished-other-task";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/shared/tabs"

export function JourneyLayout() {
  const [submitting, setSubmitting] = React.useState(false);
  const [journey, setJourney] = React.useState<{ id: Journey['id'], startAt: Journey['startAt'] } | null>(null)

  const [imgs, setImgs] = React.useState<string[]>([])

  const [tasks, setTasks] = React.useState<Task[]>([])
  const [otherTasks, setOtherTasks] = React.useState<OtherTask[]>([])

  React.useEffect(function loadJourney() {
    const journey = LocalStorage().getItem("journey")
    if (!journey) return
    setJourney({ id: journey.id, startAt: new Date(journey.startAt) })
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true)
    window.electron.startJourney()
  }

  React.useEffect(function startJourneyResult() {
    return window.electron.startJourneyResult((data) => {
      setSubmitting(false)
      if (data.success) {
        LocalStorage().setItem("journey", data.journey)
        setJourney(data.journey)
      } else {
        displayMessage(data.error, "error")
      }
    })
  }, [])

  function handleStopJourney() {
    invariant(journey, "journey is not defined")
    window.electron.endJourney(journey.id)
  }

  React.useEffect(function stopJourneyResponse() {
    return window.electron.endJourneyResult((data) => {
      if (data.success) {
        LocalStorage().removeItem("journey")
        LocalStorage().removeItem("currTask")
        setJourney(null)
      } else {
        displayMessage(data.error, "error")
      }
    })
  }, [])

  React.useEffect(function loadScreenshot() {
    return window.electron.screenShotResult((data) => {
      setImgs(data)
    })
  }, [])

  React.useEffect(function completedTask() {
    window.electron.getTodaysTasks().then(data => {
      if (data.success) {
        setTasks(data.tasks)
        setOtherTasks(data.otherTasks)
      }
    })
  }, [])

  React.useEffect(function reloadCompletedTask() {
    return window.electron.reloadTodaysTasks((data) => {
      if (data.success) {
        setTasks(data.tasks)
        setOtherTasks(data.otherTasks)
      }
    })
  }, [])

  return (
    <div className="flex items-center justify-center h-full p-8">
      {
        journey ? (
          <div className="flex gap-4 max-w-3xl w-full">
            <Tabs defaultValue="default" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="default">Zona de trabajo</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
              </TabsList>
              <TabsContent value="default">
                <div className="w-full space-y-6">
                  <JourneyTimer journey={journey} handleStopJourney={handleStopJourney} />
                  <Separator />
                  <Outlet />
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      {
                        tasks.map(t => (
                          <FinishedTask key={t.id} task={t} />
                        ))
                      }
                    </div>
                    <div className="flex flex-col gap-2">
                      {
                        otherTasks.map(t => (
                          <FinishedOtherTask key={t.id} task={t} displayFullDate={false} />
                        ))
                      }
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="history">
                History
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-screen">
            <form action="POST" onSubmit={handleSubmit}>
              <Button
                type="submit"
                name="intent"
                value="start-journey"
                variant="default"
                className="w-full px-8 flex items-center rounded-lg py-6 justify-center text-xl font-semibold uppercase"
              >
                {
                  submitting ? (
                    <>
                      Iniciando...
                      <Loader2 className="animate-spin ml-2" />
                    </>
                  ) : (
                    <>
                      Empezar jornada
                      <PlayIcon className="size-6" />
                    </>
                  )
                }
              </Button>
            </form >
            <div className="flex flex-col gap-4 justify-center items-center mt-8">
              <div className="flex gap-4 justify-center">
                <Button
                  onMouseDown={() => window.electron.takeScreenshot()}
                >
                  Screen shoot
                </Button>
                <Button
                  onMouseDown={() => setImgs([])}
                >
                  Reset
                </Button>
              </div>
              <div>
                {
                  imgs.map(i => (
                    <img key={i} className="max-w-6xl" src={i} />
                  ))
                }
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

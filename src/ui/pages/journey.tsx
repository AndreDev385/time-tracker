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

export function JourneyLayout() {
  const [submitting, setSubmitting] = React.useState(false);
  const [journey, setJourney] = React.useState<{ id: Journey['id'], startAt: Journey['startAt'] } | null>(null)

  const [img, setImage] = React.useState("")

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
        setJourney(null)
      } else {
        displayMessage(data.error, "error")
      }
    })
  }, [])

  React.useEffect(function loadScreenshot() {
    return window.electron.screenShotResult((data) => {
      setImage(data ?? "")
    })
  }, [])

  return (
    <div className="flex items-center justify-center h-screen">
      {
        journey ? (
          <div className="space-y-6 max-w-md w-full">
            <JourneyTimer journey={journey} handleStopJourney={handleStopJourney} />
            <Separator />
            <Outlet />
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
                  onMouseDown={() => setImage("")}
                >
                  Reset
                </Button>
              </div>
              <img className="max-w-6xl" src={img} />
            </div>
          </div>
        )
      }
    </div>
  )
}

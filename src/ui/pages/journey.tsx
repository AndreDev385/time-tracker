import React from "react";
import { Button } from "../components/shared/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { LocalStorage } from "../storage";
import { PlayIcon } from "@heroicons/react/24/solid";
import { displayMessage } from "../lib/utils";

export function JourneyPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true)
    window.electron.startJourney()
  }

  React.useEffect(function waitResponse() {
    window.electron.startJourneyResult((data) => {
      setSubmitting(false)
      if (data.success) {
        // save in storage
        console.log({ data })
        LocalStorage().setItem("journey", data.journey)
        navigate("/tasks")
      } else {
        displayMessage(data.error, "error")
      }
    })
  }, [navigate])

  return (
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
    </div>
  )
}

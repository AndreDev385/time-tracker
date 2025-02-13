import React from "react";
import { Button } from "../components/shared/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { LocalStorage } from "../storage";
import { PlayIcon } from "@heroicons/react/24/solid";

export function SessionPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true)
    window.electron.startSession()
  }

  React.useEffect(function waitResponse() {
    window.electron.startSessionResult((data) => {
      setSubmitting(false)
      if (data.success) {
        // save in storage
        console.log({ data })
        LocalStorage().setItem("session", data.session)
        navigate("/tasks")
      } else {
        // TODO handle error
      }
    })
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form action="POST" onSubmit={handleSubmit}>
        <Button
          type="submit"
          name="intent"
          value="start-session"
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
                Iniciar temporizador
                <PlayIcon className="size-6" />
              </>
            )
          }
        </Button>
      </form >
    </div>
  )
}

import React from "react";
import { Outlet, useNavigate } from "react-router";
import invariant from "tiny-invariant";

import { LocalStorage } from "../storage";
import { displayMessage } from "../lib/utils";
import { JourneyTimer } from "../components/tasks/journey-timer";
import { Separator } from "../components/shared/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/shared/tabs"
import { TasksHistory } from "../components/tasks/tasks-history";
import { TasksTable } from "../components/tasks/task-table";
import { OtherTasksTable } from "../components/tasks/other-task-table";
import { LogOut } from "lucide-react";
import { Button } from "../components/shared/button";
import { ROUTES } from "../main";

export function JourneyLayout() {
  const [loading, setLoading] = React.useState(false);
  const [journey, setJourney] = React.useState<{ id: Journey['id'], startAt: Journey['startAt'] } | null>(null)

  const [tasks, setTasks] = React.useState<Task[]>([])
  const [otherTasks, setOtherTasks] = React.useState<OtherTask[]>([])

  React.useEffect(function loadJourney() {
    const journey = LocalStorage().getItem("journey")
    if (!journey) return
    setJourney({ id: journey.id, startAt: new Date(journey.startAt) })
  }, [])

  function handleStartJourney() {
    setLoading(true)
    window.electron.startJourney()
  }

  React.useEffect(function startJourneyResult() {
    return window.electron.startJourneyResult((data) => {
      setLoading(false)
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

  const navigate = useNavigate()
  function handleLogOut() {
    window.electron.logout()
  }

  React.useEffect(() => {
    return window.electron.logoutResult(() => {
      navigate(ROUTES.signIn)
      LocalStorage().clear()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(function loadCreateTaskInfo() {
    async function loadCreateTaskInfo() {
      const data = await window.electron.getCreateTaskInfo()
      if (!data.success) {
        displayMessage(data.error, "error")
        return;
      }
      LocalStorage().setItem("createTaskInfo", data)
      setLoading(false)
    }
    loadCreateTaskInfo()
  }, [])

  return (
    <div className="flex h-full justify-center items-center">
      <Tabs defaultValue="default" className="w-full max-w-4xl py-8 px-2">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="default">Zona de trabajo</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="default">
          <div className="w-full space-y-6">
            <JourneyTimer
              loading={loading}
              journey={journey}
              handleStopJourney={handleStopJourney}
              handleStartJourney={handleStartJourney}
            />
            {journey ? (
              <div className="space-y-8">
                <Separator />
                <Outlet />
                <div className="flex flex-col gap-2">
                  {tasks.length > 0 ? (
                    <TasksTable
                      tasks={tasks}
                      description="Lista de tareas completadas hoy"
                      handleResumeTask={null}
                      loading={false}
                    />
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  {otherTasks.length > 0 ? (
                    <OtherTasksTable otherTasks={otherTasks} />
                  ) : null}
                </div>
              </div>
            ) : (
              <div>
                <Button
                  onMouseDown={handleLogOut}
                  variant='ghost'
                >
                  Cerrar sesión <LogOut />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="history">
          <TasksHistory />
        </TabsContent>
      </Tabs>
    </div >
  )
}

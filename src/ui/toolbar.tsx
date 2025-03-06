import React, { ReactNode } from 'react'
import { LocalStorage } from './storage'
import { formatDistanceHHMMSS } from './lib/utils';
import { Loader2 } from 'lucide-react';
import { Button } from './components/shared/button';
import { ActiveTask } from './components/tasks/active-task';
import { Textarea } from './components/shared/textarea';
import { ActiveOtherTask } from './components/tasks/active-other-task';
import { isTask } from './lib/check-task-type';

export function Toolbar() {
  const [journey, setJourney] = React.useState<{
    startAt: Journey["startAt"];
    id: Journey["id"];
  }>()
  const [currTask, setCurrTask] = React.useState<Task | OtherTask | null>()
  const [currentTime, setCurrentTime] = React.useState(new Date())
  const [loading, setLoading] = React.useState(false)

  const [comment, setComment] = React.useState<{ action: "" | "solved" | "canceled", show: boolean, value: string }>({
    action: "",
    show: false,
    value: "",
  })

  React.useEffect(function loadJourney() {
    const journey = LocalStorage().getItem("journey")
    if (journey) {
      setJourney(journey)
    }
  }, [])

  React.useEffect(function timer() {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, []);

  // TODO: when reload the component ask for the curr task from server
  //React.useEffect(function loadInitialTask() {
  //  window.electron.getToolbarTask().then((data) => {
  //    console.log({ data })
  //    if (data.success) {
  //      if (data.task) {
  //        setCurrTask(data.task)
  //      }
  //    }
  //  })
  //}, [])

  React.useEffect(function loadCurrTask() {
    window.electron.reloadToolbarData((data) => {
      console.log("load curr task", data)
      if (data.success) {
        //reset
        setComment({
          action: "",
          show: false,
          value: "",
        })
        setCurrTask(data.task ?? null)
      } else {
        //error
      }
      setLoading(false)
    })
  }, [])


  function handleCompleteTask(taskId: Task['id'], comment?: string) {
    window.electron.completeTask({ taskId, comment })
    window.electron.openMainWindow()
    setLoading(true)
  }

  function handleCancelTask(taskId: Task['id'], comment: string) {
    window.electron.cancelTask({ taskId, comment })
    window.electron.openMainWindow()
    setLoading(true)
  }

  function handlePauseTask(taskId: Task['id']) {
    window.electron.pauseTask({ taskId })
    window.electron.openMainWindow()
    setLoading(true)
  }

  if (!journey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className='animate-spin size-10' />
      </div>
    )
  }

  if (!currTask) {
    return (
      <Wrapper>
        <h2 className="text-lg font-bold">{formatDistanceHHMMSS(journey?.startAt, currentTime)}</h2>
        <Button
          onMouseDown={() => window.electron.openMainWindow()}
        >
          Empieza una tarea
        </Button>
      </Wrapper>
    )
  }

  if (isTask(currTask)) {
    if (comment.show) {
      return (
        <Wrapper>
          <div className="flex gap-4">
            <Textarea
              value={comment.value}
              onChange={(e) => setComment(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Ingresa cualquier informacion adicional con respecto al expediente"
            />
            <div className="flex justify-end">
              <Button
                onMouseDown={() => {
                  if (comment.action === "solved") {
                    handleCompleteTask(currTask.id, comment.value)
                  }
                  if (comment.action === "canceled") {
                    handleCancelTask(currTask.id, comment.value)
                  }
                }}
              >Guardar</Button>
            </div>
          </div>
        </Wrapper>
      )
    } else {
      return (
        <Wrapper>
          <h2 className="text-lg font-bold">{formatDistanceHHMMSS(journey?.startAt, currentTime)}</h2>
          <ActiveTask task={currTask!} loading={loading} setComment={setComment} handlePauseTask={handlePauseTask} />
        </Wrapper>
      )
    }
  }

  // Other task
  return (
    <Wrapper>
      <h2 className="text-lg font-bold">{formatDistanceHHMMSS(journey?.startAt, currentTime)}</h2>
      <ActiveOtherTask
        otherTask={currTask}
        loading={loading}
        handleCompleteTask={handleCompleteTask}
      />
    </Wrapper>
  )
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-row items-center justify-between w-full max-w-lg">
        {children}
      </div>
    </div>
  )
}


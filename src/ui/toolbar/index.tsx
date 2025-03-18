import React, { ChangeEvent, ReactNode } from 'react'
import { LocalStorage } from '../storage'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/shared/button';
import { ActiveTask } from '../components/tasks/active-task';
import { ActiveOtherTask } from '../components/tasks/active-other-task';
import { isTask } from '../lib/check-task-type';
import { Input } from '../components/shared/input';
import { Draggable } from './draggable';
import { SmallJourneyTimer } from './small-journey-timer';
import { TasksForm } from '../components/tasks/form';
import { OpenMainWindow } from './open-main-window-button';

export function Toolbar() {
  const [journey, setJourney] = React.useState<{
    startAt: Journey["startAt"];
    id: Journey["id"];
  }>()
  const [currTask, setCurrTask] = React.useState<Task | OtherTask | null>()
  const [loading, setLoading] = React.useState(false)

  const [comment, setComment] = React.useState<{ action: "" | "solved" | "canceled", show: boolean, value: string }>({
    action: "",
    show: false,
    value: "",
  })

  React.useEffect(function loadJourney() {
    const interval = setInterval(() => {
      const journey = LocalStorage().getItem("journey")
      if (journey) {
        setJourney(journey)
        clearInterval(interval)
      }
    }, 100); // Check every 100ms (adjust as needed)

    return () => clearInterval(interval); // Cleanup on unmount
  }, [])


  React.useEffect(function loadCurrTask() {
    return window.electron.reloadToolbarData((data) => {
      if (data.success) {
        //reset
        setComment({
          action: "",
          show: false,
          value: "",
        })
        setCurrTask(data.task ?? null)
        if (data.task) {
          LocalStorage().setItem("currTask", data.task)
        } else {
          LocalStorage().removeItem("currTask")
        }
      } else {
        // TODO: handle error
      }
      setLoading(false)
    })
  }, [])

  function handleCompleteTask(taskId: Task['id'], isOtherTask: boolean = false, comment?: string) {
    window.electron.completeTask({ taskId, comment, isOtherTask })
    setLoading(true)
  }

  function handleCancelTask(taskId: Task['id'], comment: string) {
    window.electron.cancelTask({ taskId, comment })
    setLoading(true)
  }

  function handlePauseTask(taskId: Task['id']) {
    window.electron.pauseTask({ taskId })
    setLoading(true)
  }

  if (loading || !journey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className='animate-spin size-10' />
      </div>
    )
  }

  if (!currTask) {
    return (
      <Wrapper journey={journey}>
        <TasksForm inToolbar={false} />
      </Wrapper>
    )
  }

  if (isTask(currTask)) {
    if (comment.show) {
      return (
        <Wrapper journey={journey}>
          <div className="flex w-full gap-4">
            <Input
              value={comment.value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setComment(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Observaciones"
              className='w-full'
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="destructive"
                onMouseDown={() => {
                  setComment({
                    action: "",
                    show: false,
                    value: "",
                  })
                }}
              >
                <ArrowLeft />
              </Button>
              <Button
                onMouseDown={() => {
                  if (comment.action === "solved") {
                    handleCompleteTask(currTask.id, false, comment.value)
                  }
                  if (comment.action === "canceled") {
                    handleCancelTask(currTask.id, comment.value)
                  }
                }}
              >
                <ArrowRight />
              </Button>
            </div>
          </div>
        </Wrapper>
      )
    } else {
      return (
        <Wrapper journey={journey}>
          <ActiveTask task={currTask!} loading={loading} setComment={setComment} handlePauseTask={handlePauseTask} />
        </Wrapper>
      )
    }
  }

  // Other task
  return (
    <Wrapper journey={journey}>
      <ActiveOtherTask
        otherTask={currTask}
        loading={loading}
        handleCompleteTask={handleCompleteTask}
      />
    </Wrapper>
  )
}

function Wrapper({ children, journey }: {
  children: ReactNode, journey: {
    startAt: Journey["startAt"];
    id: Journey["id"];
  }
}) {
  return (
    <div className="min-h-screen flex items-center justify-between pr-2">
      <Draggable />
      <SmallJourneyTimer journey={journey} />
      <div className="flex items-center justify-between w-full overflow-x-hidden">
        {children}
      </div>
      <OpenMainWindow />
    </div>
  )
}


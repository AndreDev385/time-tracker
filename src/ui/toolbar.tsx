import React, { ReactNode } from 'react'
import { LocalStorage } from './storage'
import { formatDistanceHHMM } from './lib/utils';
import { ExternalLink, GripVertical, Loader2 } from 'lucide-react';
import { Button } from './components/shared/button';
import { ActiveTask } from './components/tasks/active-task';
import { ActiveOtherTask } from './components/tasks/active-other-task';
import { isTask } from './lib/check-task-type';
import { Input } from './components/shared/input';

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
    const interval = setInterval(() => {
      const journey = LocalStorage().getItem("journey")
      if (journey) {
        setJourney(journey)
        clearInterval(interval)
      }
    }, 100); // Check every 100ms (adjust as needed)

    return () => clearInterval(interval); // Cleanup on unmount
  }, [])

  React.useEffect(function timer() {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, []);

  React.useEffect(function loadCurrTask() {
    return window.electron.reloadToolbarData((data) => {
      console.log("reload toolbar data", data)
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

  function handleCompleteTask(taskId: Task['id'], isOtherTask: boolean = false, comment?: string) {
    window.electron.completeTask({ taskId, comment, isOtherTask })
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

  function journeyTimer() {
    return (
      <p className='text-sm mr-4'>{formatDistanceHHMM(journey?.startAt ?? new Date(), currentTime)}</p>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className='animate-spin size-10' />
      </div>
    )
  }

  if (!currTask) {
    return (
      <Wrapper>
        {journeyTimer()}
      </Wrapper>
    )
  }

  if (isTask(currTask)) {
    if (comment.show) {
      return (
        <Wrapper>
          <div className="flex w-full gap-4">
            <Input
              value={comment.value}
              onChange={(e) => setComment(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Observaciones"
              className='w-full'
            />
            <div className="flex justify-end">
              <Button
                onMouseDown={() => {
                  if (comment.action === "solved") {
                    handleCompleteTask(currTask.id, false, comment.value)
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
          {journeyTimer()}
          <ActiveTask task={currTask!} loading={loading} setComment={setComment} handlePauseTask={handlePauseTask} />
        </Wrapper>
      )
    }
  }

  // Other task
  return (
    <Wrapper>
      {journeyTimer()}
      <ActiveOtherTask
        otherTask={currTask}
        loading={loading}
        handleCompleteTask={handleCompleteTask}
      />
    </Wrapper>
  )
}

function Wrapper({ children }: { children: ReactNode }) {
  function OpenMainWindow() {
    return (
      <div className='flex items-center'>
        <Button
          type='button'
          variant="ghost"
          size="icon"
          onMouseDown={() => window.electron.openMainWindow()}
        >
          <ExternalLink />
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-between pr-2">
      <Draggable />
      <div className="flex items-center justify-between w-full overflow-x-hidden">
        {children}
      </div>
      <OpenMainWindow />
    </div>
  )
}

function Draggable() {
  return (
    <div className='flex items-center'>
      <Button
        size="icon"
        variant="ghost"
        className="size-7 hover:bg-primary/10"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={{ "app-region": "drag" } as any}
      >
        <GripVertical className='size-5' />
      </Button >
    </div>
  )
}


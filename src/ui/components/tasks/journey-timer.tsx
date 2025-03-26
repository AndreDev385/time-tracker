import React from "react";
import { StopIcon } from "@heroicons/react/24/solid";

import { formatDistanceHHMM } from "../../lib/utils";
import { Button } from "../shared/button";

export function JourneyTimer({ journey, handleStopJourney, }: Props) {
  const [currentTime, setCurrentTime] = React.useState(new Date())

  React.useEffect(function timer() {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-row items-center justify-between p-4 border border-gray-300 rounded-lg shadow-lg w-full">
        <h2 className="font-bold">{formatDistanceHHMM(journey?.startAt, currentTime)}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg"
          onMouseDown={() => handleStopJourney()}
        >
          <StopIcon color="red" className="size-6" />
        </Button>
      </div>
    </div>
  )
}

type Props = {
  journey: { id: Journey['id'], startAt: Journey['startAt'] }
  handleStopJourney: () => void
}

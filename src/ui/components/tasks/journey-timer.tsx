import React from "react";
import { StopIcon } from "@heroicons/react/24/solid";

import { formatDistanceHHMMSS } from "../../lib/utils";
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
        <h2 className="text-lg font-bold">{formatDistanceHHMMSS(journey?.startAt, currentTime)}</h2>
        <Button
          variant="destructive"
          size="icon"
          className="rounded-lg"
          onMouseDown={() => handleStopJourney()}
        >
          <StopIcon className="size-6" />
        </Button>
      </div>
    </div>
  )
}

type Props = {
  journey: { id: Journey['id'], startAt: Journey['startAt'] }
  handleStopJourney: () => void
}

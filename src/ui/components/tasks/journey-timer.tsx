import React from "react";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";
import { formatDistanceHHMM, calculateTotalDailyJourneyTime } from "../../lib/utils";
import { Button } from "../shared/button";
import { UI_CLOCK_UPDATE_INTERVAL } from "../../lib/utils";

export function JourneyTimer({
	journey,
	loading,
	handleStopJourney,
	handleStartJourney,
}: Props) {
	const [currentTime, setCurrentTime] = React.useState(new Date());
	const [todaysJourneys, setTodaysJourneys] = React.useState<Journey[]>([]);

	React.useEffect(function timer() {
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, UI_CLOCK_UPDATE_INTERVAL);

		return () => clearInterval(interval);
	}, []);

	React.useEffect(() => {
		const fetchJourneys = async () => {
			const result = await window.electron.getTodaysJourneys();
			if (result.success) {
				setTodaysJourneys(result.journeys);
			}
		};
		fetchJourneys();
	}, [journey]); 

	return (
		<div className="w-full">
			<div className="flex flex-row items-center justify-between p-4 border border-gray-300 rounded-lg shadow-lg w-full">
				<h2 className="font-bold">
					{formatDistanceHHMM(new Date(0), new Date(calculateTotalDailyJourneyTime(todaysJourneys, currentTime)))}
				</h2>
				{journey ? (
					<Button
						variant="ghost"
						size="icon"
						className="rounded-lg"
						onMouseDown={() => handleStopJourney()}
					>
						<StopIcon color="red" className="size-6" />
					</Button>
				) : (
					<Button
						type="submit"
						name="intent"
						value="start-journey"
						variant="ghost"
						onMouseDown={() => handleStartJourney()}
					>
						{loading ? (
							<Loader2 className="animate-spin ml-2" />
						) : (
							<PlayIcon color="green" className="size-6" />
						)}
					</Button>
				)}
			</div>
		</div>
	);
}

type Props = {
	loading: boolean;
	journey: { id: Journey["id"]; startAt: Journey["startAt"] } | null;
	handleStopJourney: () => void;
	handleStartJourney: () => void;
};

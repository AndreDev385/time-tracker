import React from "react";
import { formatDistanceHHMM, calculateTotalDailyJourneyTime } from "../lib/utils";
import { UI_CLOCK_UPDATE_INTERVAL } from "../lib/utils";

export function SmallJourneyTimer({ journey }: Props) {
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
		<div className="text-sm">
			{formatDistanceHHMM(new Date(0), new Date(calculateTotalDailyJourneyTime(todaysJourneys, currentTime)))}
		</div>
	);
}

type Props = {
	journey: {
		startAt: Journey["startAt"];
		id: Journey["id"];
	};
};

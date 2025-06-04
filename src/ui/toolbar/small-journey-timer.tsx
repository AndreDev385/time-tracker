import React from "react";
import { formatDistanceHHMM } from "../lib/utils";

export function SmallJourneyTimer({ journey }: Props) {
	const [currentTime, setCurrentTime] = React.useState(new Date());

	React.useEffect(function timer() {
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<p className="text-sm mr-4">
			{formatDistanceHHMM(journey?.startAt ?? new Date(), currentTime)}
		</p>
	);
}

type Props = {
	journey: {
		startAt: Journey["startAt"];
		id: Journey["id"];
	};
};

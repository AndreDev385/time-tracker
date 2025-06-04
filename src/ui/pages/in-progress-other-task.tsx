import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { ActiveOtherTask } from "../components/tasks/active-other-task";
import { displayMessage } from "../lib/utils";
import { ROUTES } from "../main";
import { LocalStorage } from "../storage";

export function InProgressOtherTask() {
	const navigate = useNavigate();
	const { state } = useLocation();

	const otherTask = state?.otherTask as OtherTask;

	const [loading, setLoading] = React.useState(false);

	function handleCompleteTask(taskId: Task["id"]) {
		window.electron.completeTask({ taskId, isOtherTask: true });
		setLoading(true);
	}

	useEffect(() => {
		window.electron.getCurrTask().then((data) => {
			if (!data.success) {
				navigate(ROUTES.journey);
			}
		});
	}, [navigate]);

	useEffect(
		function completeTaskResponse() {
			return window.electron.completeOtherTaskResult((data) => {
				setLoading(false);
				if (data.success) {
					displayMessage("La tarea se ha completado", "success");
					LocalStorage().removeItem("currTask");
					navigate(ROUTES.journey);
				} else {
					displayMessage(data.error, "error");
				}
			});
		},
		[navigate],
	);

	return (
		<div className="border border-gray-300 rounded-lg p-4">
			<ActiveOtherTask
				otherTask={otherTask}
				loading={loading}
				handleCompleteTask={handleCompleteTask}
			/>
		</div>
	);
}

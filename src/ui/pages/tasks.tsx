import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { CollisionModal } from "../components/tasks/collision-modal";
import { TasksForm } from "../components/tasks/form";
import { isTask } from "../lib/check-task-type";
import { displayMessage } from "../lib/utils";
import { ROUTES } from "../main";
import { LocalStorage } from "../storage";

export function TasksPage() {
	const navigate = useNavigate();

	const [loading, setLoading] = React.useState(false);
	const [collisionModal, setCollisionModal] = React.useState<{
		open: boolean;
		user: string;
		taskType: string;
		taskStatus: Task["status"] | undefined;
		data: CreateTaskFormData | null;
	}>({
		open: false,
		user: "",
		taskType: "",
		taskStatus: undefined,
		data: null,
	});

	useEffect(() => {
		window.electron.getCurrTask().then((data) => {
			if (data.success && data.task) {
				if (isTask(data.task)) {
					navigate(ROUTES.inProgressTask, { state: { task: data.task } });
				} else {
					navigate(ROUTES.inProgressOtherTask, {
						state: { otherTask: data.task },
					});
				}
			}
		});
	}, [navigate]);

	useEffect(
		function createTaskResult() {
			return window.electron.createTaskResult((result) => {
				if (result.success) {
					LocalStorage().setItem("currTask", result.task);
					navigate(ROUTES.inProgressTask, { state: { task: result.task } });
				} else {
					displayMessage(result.error, "error");
				}
			});
		},
		[navigate],
	);

	useEffect(
		function createOtherTaskResult() {
			return window.electron.createOtherTaskResult((result) => {
				if (result.success) {
					LocalStorage().setItem("currTask", result.otherTask);
					navigate(ROUTES.inProgressOtherTask, {
						state: { otherTask: result.otherTask },
					});
				} else {
					displayMessage(result.error, "error");
				}
			});
		},
		[navigate],
	);

	React.useEffect(function checkTaskCollision() {
		return window.electron.checkTaskCollisionResult((data) => {
			if (data.success) {
				setCollisionModal({
					taskType: data.data?.taskType ?? "",
					taskStatus: data.data?.taskStatus as TaskStatus,
					data: data.creationData,
					user: data.data?.user ?? "",
					open: data.collision,
				});
			}
		});
	}, []);

	useEffect(
		function resumeTaskResponse() {
			return window.electron.resumeTaskResult((data) => {
				if (data.success) {
					navigate(ROUTES.inProgressTask, { state: { task: data.task } });
				} else {
					displayMessage(data.error, "error");
				}
				setLoading(false);
			});
		},
		[navigate],
	);

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center">
				<Loader2 className="animate-spin size-10" />
			</div>
		);
	}
	return (
		<>
			<CollisionModal
				state={collisionModal}
				setState={(v) =>
					setCollisionModal((prev) => ({ ...prev, open: v.open }))
				}
				submit={() =>
					window.electron.createTaskSubmit(
						collisionModal.data as CreateTaskFormData,
					)
				}
			/>
			<div className="flex flex-col gap-2 border border-gray-300 rounded-lg p-4">
				<TasksForm />
			</div>
		</>
	);
}

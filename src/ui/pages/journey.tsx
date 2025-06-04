import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import invariant from "tiny-invariant";

import { LogOut } from "lucide-react";
import { Button } from "../components/shared/button";
import { Separator } from "../components/shared/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../components/shared/tabs";
import { JourneyTimer } from "../components/tasks/journey-timer";
import { OtherTasksTable } from "../components/tasks/other-task-table";
import { TasksTable } from "../components/tasks/task-table";
import { TasksHistory } from "../components/tasks/tasks-history";
import { displayMessage } from "../lib/utils";
import { ROUTES } from "../main";
import { LocalStorage } from "../storage";

export function JourneyLayout() {
	const [loading, setLoading] = React.useState(false);
	const [journey, setJourney] = React.useState<{
		id: Journey["id"];
		startAt: Journey["startAt"];
	} | null>(null);

	const [completedTasks, setCompletedTasks] = React.useState<Task[]>([]);
	const [pausedTasks, setPausedTasks] = React.useState<Task[]>([]);
	const [otherTasks, setOtherTasks] = React.useState<OtherTask[]>([]);

	React.useEffect(() => {
		window.electron.loadJourney().then((data) => {
			if (data.success) {
				setJourney(data.journey);
			}
		});
	}, []);

	function handleStartJourney() {
		setLoading(true);
		window.electron.startJourney();
	}

	React.useEffect(function startJourneyResult() {
		return window.electron.startJourneyResult((data) => {
			setLoading(false);
			if (data.success) {
				LocalStorage().setItem("journey", data.journey);
				setJourney(data.journey);
			} else {
				displayMessage(data.error, "error");
			}
		});
	}, []);

	function handleStopJourney() {
		invariant(journey, "journey is not defined");
		window.electron.endJourney(journey.id);
	}

	React.useEffect(function stopJourneyResponse() {
		return window.electron.endJourneyResult((data) => {
			if (data.success) {
				LocalStorage().removeItem("journey");
				LocalStorage().removeItem("currTask");
				setJourney(null);
			} else {
				displayMessage(data.error, "error");
			}
		});
	}, []);

	React.useEffect(function completedTask() {
		window.electron.getTodaysTasks().then((data) => {
			if (data.success) {
				setCompletedTasks(data.tasks);
				setOtherTasks(data.otherTasks);
			}
		});

		window.electron.getMyTasks().then((data) => {
			if (data.success) {
				setPausedTasks(data.tasks);
			}
		});
	}, []);

	React.useEffect(() => {
		window.electron.reloadPausedTasks((data) => {
			if (data.success) {
				setPausedTasks(data.tasks);
			}
		});
	});

	React.useEffect(function reloadCompletedTask() {
		return window.electron.reloadTodaysTasks((data) => {
			if (data.success) {
				setCompletedTasks(data.tasks);
				setOtherTasks(data.otherTasks);
			}
		});
	}, []);

	const navigate = useNavigate();
	function handleLogOut() {
		window.electron.logout();
	}

	function handleResumeTask(taskId: Task["id"]) {
		window.electron.resumeTask({ taskId, isOtherTask: false });
	}

	useEffect(function loadMyTasks() {}, []);

	useEffect(() => {
		return window.electron.logoutResult(() => {
			navigate(ROUTES.signIn);
			LocalStorage().clear();
		});
	}, [navigate]);

	React.useEffect(function loadCreateTaskInfo() {
		async function loadCreateTaskInfo() {
			const data = await window.electron.getCreateTaskInfo();
			if (!data.success) {
				displayMessage(data.error, "error");
				return;
			}
			LocalStorage().setItem("createTaskInfo", data);
			setLoading(false);
		}
		loadCreateTaskInfo();
	}, []);

	return (
		<div className="flex h-full justify-center items-center">
			<Tabs defaultValue="default" className="w-full max-w-6xl py-8 px-2">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="default">Zona de trabajo</TabsTrigger>
					<TabsTrigger value="history">Historial</TabsTrigger>
				</TabsList>
				<TabsContent value="default">
					<div className="w-full space-y-6">
						<JourneyTimer
							loading={loading}
							journey={journey}
							handleStopJourney={handleStopJourney}
							handleStartJourney={handleStartJourney}
						/>
						{journey ? (
							<div className="space-y-8">
								<Separator />
								<Outlet />
							</div>
						) : null}
						{pausedTasks.length > 0 ? (
							<TasksTable
								readonly={!journey}
								description="Lista de tareas pausadas"
								loading={loading}
								handleResumeTask={handleResumeTask}
								tasks={pausedTasks}
							/>
						) : null}
						{completedTasks.length > 0 ? (
							<TasksTable
								readonly={!!journey}
								tasks={completedTasks}
								description="Lista de tareas completadas hoy"
								handleResumeTask={null}
								loading={false}
							/>
						) : null}
						{otherTasks.length > 0 ? (
							<OtherTasksTable otherTasks={otherTasks} />
						) : null}
						{!journey ? (
							<div>
								<Button onMouseDown={handleLogOut} variant="ghost">
									Cerrar sesión <LogOut />
								</Button>
							</div>
						) : null}
					</div>
				</TabsContent>
				<TabsContent value="history">
					<TasksHistory />
				</TabsContent>
			</Tabs>
		</div>
	);
}

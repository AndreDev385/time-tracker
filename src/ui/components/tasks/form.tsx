import React, { useState } from "react";
import { OtherTaskForm } from "./other-task-form";
import { StepsTaskForm } from "./steps-task-form";
import { LocalStorage } from "../../storage";

export function TasksForm({ inToolbar = true }: Props) {
	const [loading, setLoading] = useState(false);
	const [otherTaskForm, setOtherTaskForm] = React.useState<OtherTaskFormState>(
		OTHER_TASK_FORM_INITIAL_STATE,
	);
	const [createTaskInfo, setCreateTaskInfo] = React.useState<CreateTaskInfo>();
	// TODO: maybe it's good idea to save the user every time the journey page is loaded to avoid deprecated data in assignedProjects
	const [user, setUser] = React.useState<JWTTokenData>();

	React.useEffect(() => {
		setUser(LocalStorage().getItem("user") as JWTTokenData);
		setCreateTaskInfo(
			LocalStorage().getItem("createTaskInfo") as CreateTaskInfo,
		);
	}, []);

	const ONE_ASSIGNED_PROJECT = React.useMemo(() => {
		return user?.assignedProjects ? user.assignedProjects.length === 1 : false;
	}, [user]);

	React.useEffect(
		function loadUser() {
			setFormState((prev) => ({
				...prev,
				selectedProject: ONE_ASSIGNED_PROJECT
					? (user as JWTTokenData).assignedProjects[0]
					: null,
				step: ONE_ASSIGNED_PROJECT ? 1 : 0,
			}));
		},
		[user, ONE_ASSIGNED_PROJECT],
	);

	const INITIAL_FORM_STATE: FormState = React.useMemo(
		() => ({
			step: ONE_ASSIGNED_PROJECT ? 1 : 0,
			recordId: "",
			selectedProject: null,
			selectedBusiness: null,
			selectedTaskType: null,
			selectedRecordType: null,
			selectedWorkType: null,
		}),
		[ONE_ASSIGNED_PROJECT],
	);

	const [formState, setFormState] = React.useState(INITIAL_FORM_STATE);
	function onFormStateChange(
		name: keyof typeof INITIAL_FORM_STATE,
		value: FormState[keyof FormState],
	) {
		setFormState((prev) => ({ ...prev, [name]: value }));
	}

	function handleSubmitTask(
		createTaskFormData: CreateTaskFormData,
		confirmation = false,
	) {
		console.log(createTaskFormData, confirmation);
		if (confirmation) {
			window.electron.createTaskSubmit(createTaskFormData);
		} else {
			window.electron.checkTaskCollision(createTaskFormData);
		}
		setLoading(true);
	}

	if (!createTaskInfo || !user) return;
	return otherTaskForm.show ? (
		<OtherTaskForm
			loading={loading}
			setLoading={setLoading}
			initialState={OTHER_TASK_FORM_INITIAL_STATE}
			otherTaskForm={otherTaskForm}
			setOtherTaskForm={setOtherTaskForm}
			options={createTaskInfo.otherTaskOptions}
			userId={user.id}
		/>
	) : (
		<StepsTaskForm
			inToolbar={inToolbar}
			oneAssignedProject={ONE_ASSIGNED_PROJECT}
			showOtherTaskForm={() =>
				setOtherTaskForm((prev) => ({ ...prev, show: true }))
			}
			formState={formState}
			onFormStateChange={onFormStateChange}
			handleSubmitTask={handleSubmitTask}
			user={user}
			createTaskInfo={createTaskInfo}
		/>
	);
}

type Props = {
	inToolbar?: boolean;
};

export type FormState = {
	step: number;
	recordId: string;
	selectedProject: Project["id"] | null;
	selectedBusiness: Business["id"] | null;
	selectedTaskType: TaskType["id"] | null;
	selectedRecordType: RecordType["id"] | null;
	selectedWorkType: WorkType["id"] | null;
};

export type OtherTaskFormState = {
	label: string;
	defaultOption: string | undefined;
	comment: string;
	show: boolean;
	custom: boolean;
};

const OTHER_TASK_FORM_INITIAL_STATE: OtherTaskFormState = {
	label: "",
	show: false,
	defaultOption: undefined,
	comment: "",
	custom: false,
};

import React from "react";
import { Button } from "../shared/button";
import { Input } from "../shared/input";
import { ArrowLeft } from "lucide-react";
import { Step } from "./step";
import type { FormState } from "./form";

export function StepsTaskForm({
	formState,
	onFormStateChange,
	handleSubmitTask,
	user,
	createTaskInfo,
	showOtherTaskForm,
	oneAssignedProject,
	inToolbar,
}: Props) {
	const [recordIdError, setRecordIdError] = React.useState("");
	const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

	const steps = [
		{
			message: "No tienes projectos assignados",
			options: createTaskInfo.projects,
			setSelected: (id: string) => {
				setSelectedValues([
					...selectedValues,
					createTaskInfo.projects.find((p) => p.id === id)?.name as string,
				]);
				onFormStateChange("selectedProject", id);
				onFormStateChange("step", 1);
			},
		},
		{
			message: "No hay tipos de trabajo registrados",
			options: createTaskInfo.workTypes,
			setSelected: (id: string) => {
				setSelectedValues([
					...selectedValues,
					createTaskInfo.workTypes.find((wt) => wt.id === id)?.name as string,
				]);
				onFormStateChange("selectedWorkType", id);
				onFormStateChange("step", 2);
			},
		},
		{
			message: "No hay tipos de tarea registrados",
			options: createTaskInfo.taskTypes.filter(function workTypeOptions(tp) {
				const workType = createTaskInfo.workTypes.find(
					(wt) => formState.selectedWorkType === wt.id,
				);
				return workType?.taskTypes.includes(tp.id);
			}),
			setSelected: (id: string) => {
				// validate recordId
				if (formState.recordId.trim() === "") {
					setRecordIdError("Debe ingresar un ID de tarea");
					return;
				}
				setRecordIdError("");
				//
				setSelectedValues([
					...selectedValues,
					createTaskInfo.taskTypes.find((t) => t.id === id)?.name as string,
				]);
				onFormStateChange("selectedTaskType", id);
				onFormStateChange("step", 3);
			},
		},
		{
			message: "No hay empresas registradas",
			options: createTaskInfo.business,
			setSelected: (id: string) => {
				const workType = createTaskInfo.workTypes.find(
					(wt) => formState.selectedWorkType === wt.id,
				);
				if (workType?.recordTypes.length === 0) {
					handleSubmitTask({
						userId: user.id,
						projectId: formState.selectedProject as string,
						workTypeId: formState.selectedWorkType as string,
						recordId: formState.recordId,
						taskTypeId: formState.selectedTaskType as string,
						businessId: id as string,
					});
					return;
				}
				onFormStateChange("selectedBusiness", id);
				setSelectedValues([
					...selectedValues,
					createTaskInfo.business.find((t) => t.id === id)?.name as string,
				]);
				onFormStateChange("step", 4);
			},
		},
		{
			message: "No hay tipos de expedientes registrados",
			options: createTaskInfo.recordTypes.filter(function workTypeOptions(rt) {
				const workType = createTaskInfo.workTypes.find(
					(wt) => formState.selectedWorkType === wt.id,
				);
				return workType?.recordTypes.includes(rt.id);
			}),
			setSelected: (id: string) => {
				onFormStateChange("selectedRecordType", id);
				handleSubmitTask({
					userId: user.id,
					projectId: formState.selectedProject as string,
					workTypeId: formState.selectedWorkType as string,
					recordId: formState.recordId,
					taskTypeId: formState.selectedTaskType as string,
					businessId: formState.selectedBusiness as string,
					recordTypeId: formState.selectedRecordType
						? formState.selectedRecordType
						: id,
				});
			},
		},
	];

	function StepBackButton() {
		return (
			<Button
				variant="ghost"
				size="icon"
				className="rounded-lg"
				onMouseDown={() => {
					setSelectedValues(
						selectedValues.splice(0, selectedValues.length - 1),
					);
					onFormStateChange("step", formState.step - 1);
				}}
			>
				<ArrowLeft color="red" />
			</Button>
		);
	}

	function renderStep(step: number) {
		if (step === 1) {
			return (
				<div className="flex justify-between w-full gap-4">
					<div className="flex justify-between w-full gap-4">
						<Step {...steps[step]} />
					</div>
					{inToolbar ? (
						<div className="w-36">
							<p
								className="hover:underline hover:cursor-pointer hover:font-bold text-end text-sm"
								onMouseDown={() => showOtherTaskForm()}
							>
								Otras tareas
							</p>
						</div>
					) : null}
					<div>{!oneAssignedProject ? <StepBackButton /> : null}</div>
				</div>
			);
		}
		if (step === 2) {
			return (
				<div className="flex w-full gap-4">
					<Input
						value={formState.recordId}
						onChange={(e) => onFormStateChange("recordId", e.target.value)}
						name="recordId"
						className={`w-44 ${recordIdError && "border-red-500"}`}
						placeholder="ID de tarea"
					/>
					<Step {...steps[step]} />
					<div>
						<StepBackButton />
					</div>
				</div>
			);
		}

		if (step < steps.length) {
			return (
				<div className="flex justify-between w-full items-center gap-4">
					<Step {...steps[step]} />
					<div>{step > 0 ? <StepBackButton /> : null}</div>
				</div>
			);
		}

		return null;
	}

	return (
		<>
			{/* PROJECT step 0 */}
			{inToolbar ? (
				<div className="flex gap-4">
					{selectedValues.map((v) => (
						<p key={v} className="text-sm text-blue-500">
							{v}
						</p>
					))}
				</div>
			) : null}
			{renderStep(formState.step)}
		</>
	);
}

type Props = {
	formState: FormState;
	onFormStateChange: (
		name: keyof FormState,
		value: FormState[keyof FormState],
	) => void;
	handleSubmitTask: (
		createTaskFormData: CreateTaskFormData,
		confirmation?: boolean,
	) => void;
	user: JWTTokenData;
	createTaskInfo: CreateTaskInfo;
	showOtherTaskForm: () => void;
	oneAssignedProject: boolean;
	inToolbar: boolean;
};

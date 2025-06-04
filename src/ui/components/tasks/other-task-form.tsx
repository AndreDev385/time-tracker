import type React from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../shared/select";
import { Button } from "../shared/button";
import { Input } from "../shared/input";
import type { OtherTaskFormState } from "./form";

export function OtherTaskForm({
	otherTaskForm,
	setOtherTaskForm,
	options,
	initialState,
	userId,
	loading,
	setLoading,
}: Props) {
	function handleSubmitOtherTask(comment: string, defaultOptionId?: string) {
		setLoading(true);
		window.electron.createOtherTaskSubmit({
			userId,
			defaultOptionId,
			comment,
		});
	}

	return (
		<div className="flex gap-2 w-full">
			{otherTaskForm.custom ? (
				<Input
					value={otherTaskForm.comment}
					onChange={(e) =>
						setOtherTaskForm((prev) => ({ ...prev, comment: e.target.value }))
					}
					placeholder="Ingresa la tarea"
				/>
			) : (
				<Select
					value={otherTaskForm.label}
					onValueChange={(v) =>
						setOtherTaskForm((prev) => {
							if (v === "custom") {
								return {
									...prev,
									custom: true,
									label: v,
									comment: "",
									defaultOption: undefined,
								};
							}
							const option = options.find((o) => o.value === v);
							return {
								...prev,
								comment: v,
								defaultOption: option?.id,
								custom: false,
								label: v,
							};
						})
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="Selecciona una opcion" />
					</SelectTrigger>
					<SelectContent>
						{options.map((o) => (
							<SelectItem key={o.id} value={o.value}>
								{o.value}
							</SelectItem>
						))}
						<SelectItem value="custom">Otra tarea</SelectItem>
					</SelectContent>
				</Select>
			)}
			<Button
				variant="ghost"
				size="icon"
				onMouseDown={() => {
					if (otherTaskForm.custom) {
						setOtherTaskForm((prev) => ({
							...prev,
							custom: false,
							label: "",
							comment: "",
							defaultOption: undefined,
						}));
					} else {
						setOtherTaskForm(initialState);
					}
				}}
				disabled={loading}
			>
				{loading ? (
					<Loader2 className="animate-spin" />
				) : (
					<ArrowLeft color="red" />
				)}
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onMouseDown={() =>
					handleSubmitOtherTask(
						otherTaskForm.comment,
						otherTaskForm.defaultOption,
					)
				}
				disabled={otherTaskForm.comment.trim() === "" || loading}
			>
				{loading ? (
					<Loader2 className="animate-spin" />
				) : (
					<ArrowRight color="blue" />
				)}
			</Button>
		</div>
	);
}

type Props = {
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	otherTaskForm: OtherTaskFormState;
	setOtherTaskForm: React.Dispatch<React.SetStateAction<OtherTaskFormState>>;
	options: CreateTaskInfo["otherTaskOptions"];
	initialState: OtherTaskFormState;
	userId: string;
};

import { Check, Loader2 } from "lucide-react";
import { Button } from "../shared/button";

export function ActiveOtherTask({
	otherTask,
	loading,
	handleCompleteTask,
}: Props) {
	return (
		<div className="flex justify-between gap-4 items-center w-full">
			<div>
				<p className="text-sm">{otherTask.comment}</p>
			</div>
			<div className="flex gap-2">
				<Button
					variant="ghost"
					size="icon"
					disabled={loading}
					className="rounded-lg hover:bg-green-500/10"
					onMouseDown={() => handleCompleteTask(otherTask.id, true)}
				>
					{loading ? (
						<Loader2 className="animate-spin" />
					) : (
						<Check className="size-6 text-green-500" />
					)}
				</Button>
			</div>
		</div>
	);
}

type Props = {
	otherTask: OtherTask;
	loading: boolean;
	handleCompleteTask: (taskId: Task["id"], isOtherThask: boolean) => void;
};

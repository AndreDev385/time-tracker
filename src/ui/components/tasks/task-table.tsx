import { Check, Loader2, MessageSquareText, X } from "lucide-react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { PlayIcon } from "@heroicons/react/24/solid";

import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../shared/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../shared/tooltip";
import { DATE_FORMATS, formatDate, taskDuration } from "../../lib/utils";
import { LocalStorage } from "../../storage";
import { Button } from "../shared/button";

export function TasksTable({
	tasks,
	handleResumeTask,
	description,
	readonly = false,
	loading = false,
}: Props) {
	const format = DATE_FORMATS.ddMMyyyyhmma;
	const info = LocalStorage().getItem("createTaskInfo");

	function actions(t: Task) {
		const values = {
			solved: <Check color="green" />,
			canceled: <X color="red" />,
			paused: (
				<Button
					variant="ghost"
					size="icon"
					onMouseDown={() => {
						if (handleResumeTask) {
							handleResumeTask(t.id);
						}
					}}
					disabled={loading || readonly}
				>
					{loading ? (
						<Loader2 className="animate-spin" />
					) : (
						<PlayIcon color="green" className="size-6" />
					)}
				</Button>
			),
			pending: null,
		};

		return values[t.status];
	}

	return (
		<Table>
			<TableCaption>{description}</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>U. Modificación</TableHead>
					<TableHead>Expediente</TableHead>
					<TableHead>T. Trabajo</TableHead>
					<TableHead>T. Tarea</TableHead>
					<TableHead>T. Exp.</TableHead>
					<TableHead>Empresa</TableHead>

					<TableHead>Duración</TableHead>
					<TableHead>Observación</TableHead>
					<TableHead />
				</TableRow>
			</TableHeader>
			<TableBody>
				{tasks.map((t) => {
					const summary = {
						workType: info?.workTypes.find((wt) => wt.id === t.workTypeId)
							?.name,
						taskType: info?.taskTypes.find((wt) => wt.id === t.taskTypeId)
							?.name,
						recordType: info?.recordTypes.find((wt) => wt.id === t.recordTypeId)
							?.name,
						business: info?.business.find((wt) => wt.id === t.businessId)?.name,
					};

					function renderComment() {
						if (t?.comment) {
							return (
								<div className="text-muted-foreground text-xs truncate max-w-[200px]">
									{t?.comment}
								</div>
							);
						}
						if (!t?.comment && !t?.markedAsUnproductiveByUser) {
							return <span />;
						}
						return <MessageSquareText className="size-4" />;
					}

					return (
						<TableRow key={t.id}>
							<TableCell>
								{formatDate(new Date(t.updatedAt), DATE_FORMATS.ddMMyyyy)}
							</TableCell>
							<TableCell>{t.recordId}</TableCell>
							<TableCell>{summary.workType}</TableCell>
							<TableCell>{summary.taskType}</TableCell>
							<TableCell>{summary.recordType}</TableCell>
							<TableCell>{summary.business}</TableCell>

							<TableCell>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger>{taskDuration(t.intervals)}</TooltipTrigger>
										<TooltipContent>
											{t.intervals.map((interval) => (
												<p key={interval.startAt.getTime()}>
													{formatDate(interval.startAt, format)} -{" "}
													{formatDate(
														interval.endAt as Date,
														DATE_FORMATS.hmma,
													)}
												</p>
											))}
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</TableCell>

							<TableCell className="text-center">
								<div className="max-w-[200px]">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<div className="truncate w-full">{renderComment()}</div>
											</TooltipTrigger>
											<TooltipContent>
												<p>{t?.comment}</p>
												{t?.markedAsUnproductiveByUser && (
													<p>
														{t.markedAsUnproductiveByUser.name} te ha marcado
														esta tarea como no productiva
													</p>
												)}
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							</TableCell>
							<TableCell>{actions(t)}</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}

type Props = {
	readonly: boolean;
	loading: boolean;
	description: string;
	handleResumeTask: ((taskId: Task["id"]) => void) | null;
	tasks: Task[];
};

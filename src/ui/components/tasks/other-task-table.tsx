import { Check, X } from "lucide-react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../shared/table";
import { DATE_FORMATS, formatDate } from "../../lib/utils";

export function OtherTasksTable({ otherTasks }: Props) {
	return (
		<Table>
			<TableCaption>Otras tareas</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Fecha</TableHead>
					<TableHead>Tarea</TableHead>
					<TableHead>Duración</TableHead>
					<TableHead />
				</TableRow>
			</TableHeader>
			<TableBody>
				{otherTasks.map((t) => {
					return (
						<TableRow key={t.id}>
							<TableCell>
								{formatDate(new Date(t.endAt as Date), DATE_FORMATS.ddMMyyyy)}
							</TableCell>
							<TableCell>{t.comment}</TableCell>
							<TableCell>
								<p>
									{formatDate(t.startAt, DATE_FORMATS.hmma)} -{" "}
									{formatDate(t.endAt as Date, DATE_FORMATS.hmma)}
								</p>
							</TableCell>
							<TableCell className="flex justify-end">
								{t.status === "solved" ? (
									<Check color="green" />
								) : (
									<X color="red" />
								)}
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}

type Props = {
	otherTasks: OtherTask[];
};

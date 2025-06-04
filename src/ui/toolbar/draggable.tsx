import { GripVertical } from "lucide-react";
import { Button } from "../components/shared/button";

export function Draggable() {
	return (
		<div className="flex items-center">
			<Button
				size="icon"
				variant="ghost"
				className="size-7 hover:bg-primary/10"
				// biome-ignore lint/suspicious/noExplicitAny: especial case
				style={{ "app-region": "drag" } as any}
			>
				<GripVertical className="size-5" />
			</Button>
		</div>
	);
}

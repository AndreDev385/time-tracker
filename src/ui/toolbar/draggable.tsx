import { GripVertical } from "lucide-react";
import { Button } from "../components/shared/button";

export function Draggable() {
	return (
		<div className="flex items-center">
			<Button
				size="icon"
				variant="ghost"
				className="size-7 hover:bg-primary/10"
				style={{ "app-region": "drag" } as React.CSSProperties & { "app-region": string }}
			>
				<GripVertical className="size-5" />
			</Button>
		</div>
	);
}

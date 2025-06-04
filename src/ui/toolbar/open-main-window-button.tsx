import { ExternalLink } from "lucide-react";
import { Button } from "../components/shared/button";

export function OpenMainWindow() {
	return (
		<div className="flex items-center">
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onMouseDown={() => window.electron.openMainWindow()}
			>
				<ExternalLink />
			</Button>
		</div>
	);
}

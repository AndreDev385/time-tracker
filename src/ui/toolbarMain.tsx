import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Toolbar } from "./toolbar";

createRoot(document.getElementById("toolbar") as HTMLDivElement).render(
	<StrictMode>
		<Toolbar />
	</StrictMode>,
);

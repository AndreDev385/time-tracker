import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router";

import "./index.css";
import { SignInPage } from "./pages/sign-in";
import { JourneyLayout } from "./pages/journey";
import { TasksPage } from "./pages/tasks";
import { Toaster } from "./components/shared/sonner";
import { InProgressTask } from "./pages/in-progress-task";
import { InProgressOtherTask } from "./pages/in-progress-other-task";

export const ROUTES = {
	signIn: "/",
	journey: "/journey",
	inProgressTask: "/journey/in-progress-task",
	inProgressOtherTask: "/journey/in-progress-other-task",
};

createRoot(document.getElementById("root") as HTMLDivElement).render(
	<StrictMode>
		<HashRouter>
			<Routes>
				<Route index element={<SignInPage />} />
				<Route path="journey" element={<JourneyLayout />}>
					<Route index element={<TasksPage />} />
					<Route path="in-progress-task" element={<InProgressTask />} />
					<Route
						path="in-progress-other-task"
						element={<InProgressOtherTask />}
					/>
				</Route>
			</Routes>
			<Toaster />
		</HashRouter>
	</StrictMode>,
);

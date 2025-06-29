type SuccessResponse = { success: true };
type ErrorResponse = { success: false; error: string };

type UnsubscribeFunction = () => void;

// SignIn
type SignInFormData = {
	email: string;
	password: string;
};

type SignInResult =
	| {
			success: true;
			token: string;
	  }
	| {
			success: false;
			error: string;
	  };

// CreateTask
type CreateTaskFormData = {
	userId: string;
	projectId: string;
	businessId: string;
	taskTypeId: string;
	recordTypeId?: string;
	workTypeId: string;
	recordId: string;
};

type CreateOtherTaskData = {
	userId: string;
	comment: string;
	defaultOptionId?: string;
};

type JWTTokenData = {
	id: numer;
	name: string;
	email: string;
	role: string;
	assignedProjects: string[];
};

type Journey = { startAt: Date; id: string; endAt: Date | null };
type Project = { id: string; name: string };
type Business = { id: string; name: string };
type TaskType = { id: string; name: string };
type RecordType = { id: string; name: string };
type WorkType = {
	id: string;
	name: string;
	taskTypes: string[];
	recordTypes: string[];
};
type OtherTaskOption = { id: string; value: string };

type CreateTaskInfo = {
	projects: Project[];
	business: Business[];
	taskTypes: TaskType[];
	workTypes: WorkType[];
	recordTypes: RecordType[];
	otherTaskOptions: OtherTaskOption[];
};

type Interval = {
	startAt: Date;
	endAt: Date | null;
};

type TaskStatus = "pending" | "canceled" | "solved" | "paused";

type Task = {
	id: string;
	userId: string;
	projectId: string;
	businessId: string;
	taskTypeId: string;
	recordTypeId: string;
	workTypeId: string;
	recordId: string;
	intervals: Interval[];
	comment: string;
	status: TaskStatus;
	updatedAt: string;
	markedAsUnproductiveBy: number | null;
	markedAsUnproductiveByUser?: {
		id: users.id;
		name: users.name;
	};
};

type OtherTask = {
	id: string;
	userId: string;
	defaultOptionId?: number;
	comment: string;
	startAt: Date;
	endAt: Date | null;
	status: TaskStatus;
	updatedAt: string;
};

type AppSetting = {
	name: string;
	value: string;
};

interface Window {
	electron: {
		takeScreenshot: () => void;
		screenShotResult: (callback: (data: string[]) => void) => void;

		signInSubmit: (data: SignInFormData) => void;
		signInResult: (callback: (data: SignInResult) => void) => void;

		checkToken: () => Promise<
			({ user: JWTTokenData } & SuccessResponse) | ErrorResponse
		>;
		getMyTasks: () => Promise<
			({ tasks: Task[] } & SuccessResponse) | ErrorResponse
		>;

		startJourney: () => void;
		startJourneyResult: (
			callback: (
				data: ({ journey: Journey } & SuccessResponse) | ErrorResponse,
			) => void,
		) => void;
		endJourney: (id: string) => void;
		endJourneyResult: (
			callback: (
				data: ({ journey: Journey } & SuccessResponse) | ErrorResponse,
			) => void,
		) => void;
		loadJourney: () => Promise<
			({ journey: Journey } & SuccessResponse) | ErrorResponse
		>;

		getCreateTaskInfo: () => Promise<
			(CreateTaskInfo & SuccessResponse) | ErrorResponse
		>;

		checkTaskCollision: (data: CreateTaskFormData) => void;
		checkTaskCollisionResult: (
			callback: (
				data: {
					collision: boolean;
					creationData: CreateTaskFormData;
					data?: { user: string; taskType: string; taskStatus: Task["status"] };
				} & SuccessResponse,
			) => void,
		) => void;

		createTaskSubmit: (data: CreateTaskFormData) => void;
		createTaskResult: (
			callback: (
				data: ({ task: Task } & SuccessResponse) | ErrorResponse,
			) => void,
		) => void;

		createOtherTaskSubmit: (data: CreateOtherTaskData) => void;
		createOtherTaskResult: (
			callback: (
				data: ({ otherTask: OtherTask } & SuccessResponse) | ErrorResponse,
			) => void,
		) => void;

		resumeTask: (data: { taskId: Task["id"]; isOtherTask?: boolean }) => void;
		resumeTaskResult: (
			callback: (
				data: ({ task: Task } & SuccessResponse) | ErrorResponse,
			) => void,
		) => void;

		pauseTask: (data: { taskId: Task["id"] }) => void;
		pauseTaskResult: (
			callback: (data: SuccessResponse | ErrorResponse) => void,
		) => void;

		completeTask: (data: {
			taskId: Task["id"];
			isOtherTask?: boolean;
			comment?: string;
		}) => void;
		completeTaskResult: (
			callback: (data: SuccessResponse | ErrorResponse) => void,
		) => void;
		completeOtherTaskResult: (
			callback: (data: SuccessResponse | ErrorResponse) => void,
		) => void;

		cancelTask: (data: { taskId: Task["id"]; comment?: string }) => void;
		cancelTaskResult: (
			callback: (data: SuccessResponse | ErrorResponse) => void,
		) => void;

		getCurrTask: () => Promise<
			({ task?: Task | OtherTask } & SuccessResponse) | ErrorResponse
		>;
		reloadToolbarData: (
			callback: (
				data: ({ task?: Task | OtherTask } & SuccessResponse) | ErrorResponse,
			) => void,
		) => void;

		openMainWindow: () => void;

		getTodaysTasks: () => Promise<
			| ({ tasks: Task[]; otherTasks: OtherTask[] } & SuccessResponse)
			| ErrorResponse
		>;
		reloadTodaysTasks: (
			callback: (
				data:
					| ({ tasks: Task[]; otherTasks: OtherTask[] } & SuccessResponse)
					| ErrorResponse,
			) => void,
		) => void;
		reloadPausedTasks: (
			callback: (
				data: ({ tasks: Task[] } & SuccessResponse) | ErrorResponse,
			) => void,
		) => void;

		getTaskHistory: (offset: number, limit: number, recordId?: string) => void;
		getTaskHistoryResult: (
			callback: (
				data:
					| ({ count: number; rows: Task[] } & SuccessResponse)
					| ErrorResponse,
			) => void,
		) => void;

		logout: () => void;
		logoutResult: (callback: () => void) => void;
	};
}

type EventPayloadMapping = {
	takeScreenshot: undefined;
	screenShotResult: string[];

	signInSubmit: SignInFormData;
	signInResult: SignInResult;

	checkToken: Promise<
		({ user: JWTTokenData } & SuccessResponse) | ErrorResponse
	>;
	getMyTasks: Promise<({ tasks: Task[] } & SuccessResponse) | ErrorResponse>;

	startJourney: undefined;
	startJourneyResult: ({ journey: Journey } & SuccessResponse) | ErrorResponse;
	endJourney: string;
	endJourneyResult: ({ journey: Journey } & SuccessResponse) | ErrorResponse;
	loadJourney: Promise<
		({ journey: Journey } & SuccessResponse) | ErrorResponse
	>;

	getCreateTaskInfo: Promise<
		(CreateTaskInfo & SuccessResponse) | ErrorResponse
	>;

	checkTaskCollision: CreateTaskFormData;
	checkTaskCollisionResult: {
		collision: boolean;
		creationData: CreateTaskFormData;
		data?: {
			user: string;
			taskType: string;
			taskStatus: Task["status"];
		};
	} & SuccessResponse;

	createTaskSubmit: CreateTaskFormData;
	createTaskResult: ({ task: Task } & SuccessResponse) | ErrorResponse;

	createOtherTaskSubmit: CreateOtherTaskData;
	createOtherTaskResult:
		| ({ otherTask: OtherTask } & SuccessResponse)
		| ErrorResponse;

	resumeTask: { taskId: Task["id"] };
	resumeTaskResult: ({ task: Task } & SuccessResponse) | ErrorResponse;

	pauseTask: { taskId: Task["id"] };
	pauseTaskResult: SuccessResponse | ErrorResponse;

	cancelTask: { taskId: Task["id"]; comment?: string };
	cancelTaskResult: SuccessResponse | ErrorResponse;

	completeTask: { taskId: Task["id"]; comment?: string; isOtherTask?: boolean };
	completeTaskResult: SuccessResponse | ErrorResponse;
	completeOtherTaskResult: SuccessResponse | ErrorResponse;

	getCurrTask: Promise<
		({ task?: Task | OtherTask } & SuccessResponse) | ErrorResponse
	>;
	reloadToolbarData:
		| ({ task?: Task | OtherTask } & SuccessResponse)
		| ErrorResponse;

	openMainWindow: undefined;

	getTodaysTasks: Promise<
		| ({ tasks: Task[]; otherTasks: OtherTask[] } & SuccessResponse)
		| ErrorResponse
	>;
	reloadTodaysTasks:
		| ({ tasks: Task[]; otherTasks: OtherTask[] } & SuccessResponse)
		| ErrorResponse;
	reloadPausedTasks: ({ tasks: Task[] } & SuccessResponse) | ErrorResponse;

	getTaskHistory: { offset: number; limit: number; recordId?: string };
	getTaskHistoryResult:
		| ({ count: number; rows: Task[] } & SuccessResponse)
		| ErrorResponse;

	logout: undefined;
	logoutResult: undefined;
};

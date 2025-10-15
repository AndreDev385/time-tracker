import dotenv from "dotenv";

dotenv.config();

export const config = {
	backBlaze: {
		key: process.env.BACK_BLAZE_KEY as string,
		secret: process.env.BACK_BLAZE_SECRET as string,
		bucketName: "time-tracker-bucket",
		region: "us-east-005",
		uploadUrlExpiry: 3600,
	},
	nodeEnv: process.env.NODE_ENV,
	ui: {
		clockUpdateInterval: 1000,
		debounceDelay: 500,
		taskHistoryPaginationLimits: [20, 30, 40, 50],
	},
	windows: {
		main: {
			width: 1280,
			height: 800,
			minWidth: 1000,
			minHeight: 800,
		},
		toolbar: {
			width: 700,
			height: 30,
		},
	},
};

export const DEFAULT_IDLE_TIME_ALLOWED = 300; // 5 minutes
export const DEFAULT_CAPTURE_INTERVAL = 300; //
export const UPDATE_HEARTBEAT_INTERVAL = 60;

// UI constants
export const UI_CLOCK_UPDATE_INTERVAL = config.ui.clockUpdateInterval;
export const UI_DEBOUNCE_DELAY = config.ui.debounceDelay;
export const UI_TASK_HISTORY_PAGINATION_LIMITS = config.ui.taskHistoryPaginationLimits;

// Window constants
export const WINDOW_MAIN_WIDTH = config.windows.main.width;
export const WINDOW_MAIN_HEIGHT = config.windows.main.height;
export const WINDOW_MAIN_MIN_WIDTH = config.windows.main.minWidth;
export const WINDOW_MAIN_MIN_HEIGHT = config.windows.main.minHeight;
export const WINDOW_TOOLBAR_WIDTH = config.windows.toolbar.width;
export const WINDOW_TOOLBAR_HEIGHT = config.windows.toolbar.height;

// Backblaze constants
export const BACKBLAZE_BUCKET_NAME = config.backBlaze.bucketName;
export const BACKBLAZE_REGION = config.backBlaze.region;
export const BACKBLAZE_UPLOAD_URL_EXPIRY = config.backBlaze.uploadUrlExpiry;

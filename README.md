# Time Tracker Desktop App

A desktop application built with Electron and React that tracks user productivity by monitoring work journeys, tasks, and screen activity. It sends collected statistics to a backend server for performance analysis and reporting.

## Features

### Journey Tracking
- **Daily Work Sessions**: Start and end work journeys to track total daily work hours
- **Idle Monitoring**: Automatically pauses journeys when user is inactive for configurable time (default 5 minutes)
- **Heartbeat Updates**: Maintains active session status with periodic server updates

### Task Management
- **Task Creation**: Create detailed tasks with project, work type, and record type assignments
- **Time Tracking**: Automatic time tracking for active tasks with pause/resume functionality
- **Collision Detection**: Prevents overlapping tasks and provides conflict resolution
- **Other Tasks**: Support for non-standard task types with flexible categorization

### Screen Capture & Monitoring
- **Periodic Screenshots**: Captures all connected displays every 5 minutes during active journeys
- **Cloud Storage**: Uploads screenshots to Backblaze B2 for secure storage
- **Activity Evidence**: Provides visual proof of work activity for performance reviews

### User Interface
- **Main Application Window**: Full-featured interface for task and journey management
- **Always-on-Top Toolbar**: Compact window showing current task and journey status
- **System Tray Integration**: Quick access and status indicators
- **Auto-start**: Launches automatically on system login

## Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript, Tailwind CSS, Radix UI components
- **Desktop Framework**: Electron for cross-platform desktop app
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: Local storage for client-side persistence
- **Cloud Storage**: AWS SDK with Backblaze B2 for screenshot uploads

### Project Structure
```
src/
├── assets/            # Static assets (images, icons)
├── electron/          # Main process (Node.js)
│   ├── handlers/     # IPC event handlers (app, effects)
│   ├── lib/          # Utilities (JWT, IPC, captures, logging, etc.)
│   ├── server/       # API communication handlers
│   ├── config.ts     # Centralized configuration constants
│   └── main.ts       # Application entry point
├── ui/               # Renderer process (React)
│   ├── assets/       # UI-specific assets
│   ├── components/   # Reusable UI components
│   │   ├── shared/   # Common components (buttons, inputs, etc.)
│   │   └── tasks/    # Task-specific components
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Application pages
│   └── toolbar/      # Compact toolbar components
├── types.d.ts        # Global type definitions
└── config.ts         # Server-side configuration
```

### Data Flow
1. User authenticates with backend server
2. JWT token stored securely in user data directory
3. App monitors user activity and collects statistics
4. Data sent to server via REST API calls
5. Screenshots uploaded directly to cloud storage

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (create `.env` file):
   ```
   BACK_BLAZE_KEY=your_backblaze_key
   BACK_BLAZE_SECRET=your_backblaze_secret
   API_URL=https://your-backend-server.com
   ```
4. Build the application:
   ```bash
   npm run build
   ```

### Development
```bash
# Start development server (parallel React + Electron)
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking
tsc -b

# Create distributable packages
npm run dist:linux  # or dist:mac, dist:win
```

#### Development Tips
- **Linting**: Run `npm run lint` before commits to ensure code quality
- **Type Checking**: Use `tsc -b` to catch TypeScript errors
- **Debugging**: Use React DevTools for UI, Electron DevTools for main process
- **Logging**: Check logs in the user data directory for debugging

## Usage

1. **Sign In**: Launch the app and authenticate with your credentials
2. **Start Journey**: Begin your work session to start tracking time
3. **Create Tasks**: Add tasks for specific work items you need to complete
4. **Monitor Progress**: Use the toolbar to see current task and time elapsed
5. **End Session**: Complete your journey when finished for the day

The app will automatically:
- Capture screenshots during active work sessions
- Pause tracking when you're idle
- Sync all data with the backend server

## Configuration

### Environment Variables
Create a `.env` file in the project root with the following variables:

```env
# Backblaze B2 Cloud Storage
BACK_BLAZE_KEY=your_backblaze_application_key
BACK_BLAZE_SECRET=your_backblaze_application_key_id

# Backend API
API_URL=https://your-backend-server.com

# Node Environment
NODE_ENV=development  # or production
```

### Application Settings
The app includes centralized configuration in `src/electron/config.ts`:

- **UI Settings**: Clock update intervals, debounce delays, pagination limits
- **Window Settings**: Main and toolbar window dimensions
- **Cloud Storage**: Backblaze bucket details and upload parameters
- **Timing Constants**: Idle thresholds, capture intervals, heartbeat frequencies

Settings can also be configured through the backend server:
- Idle timeout duration
- Screenshot capture interval
- Available projects, work types, and record types

## Security

- JWT tokens stored encrypted in user data directory
- Screenshots uploaded securely to cloud storage
- IPC communication validated for frame origin
- No sensitive data logged in production

## Troubleshooting

### Common Issues
- **App won't start**: Check Node.js version (18+) and ensure all dependencies are installed
- **Authentication fails**: Verify API_URL and credentials in `.env`
- **Screenshots not uploading**: Check Backblaze credentials and bucket permissions
- **TypeScript errors**: Run `tsc -b` to identify type issues
- **Build fails**: Ensure all environment variables are set and run `npm run lint` first

### Logs
- Application logs are stored in the user data directory
- Use structured logging for debugging production issues
- Check console in Electron DevTools for development errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Run type checking: `tsc -b`
6. Submit a pull request

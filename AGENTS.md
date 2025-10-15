# Agent Guidelines for Time Tracker

## Commands
- **Build**: `npm run build` (TypeScript + Vite)
- **Lint**: `npm run lint` (ESLint)
- **Type check**: `tsc -b` (from build script)
- **Dev**: `npm run dev` (parallel React + Electron)

## Code Style
- **Language**: TypeScript with strict mode, React JSX
- **Imports**: `import type` for types, relative paths, path aliases `~/*`
- **Naming**: camelCase functions/variables, PascalCase components
- **Error handling**: Try-catch with structured error responses `{success: boolean, error?: string}`
- **Styling**: Tailwind CSS with shadcn/ui components, CSS variables for theming
- **File structure**: `.ts` server-side, `.tsx` React components
- **Logging**: Winston logger with correlation IDs for server operations
- **Functional Programming**: Use immutable state updates, pure functions where possible, and isolate side effects via effects system for better readability, testability, and debugging
- **Modularization**: Split logic into smaller, focused modules (e.g., IPC handlers in dedicated files) to improve maintainability and separation of concerns

## State Management
- Avoid direct state mutation; use functional updates and immutable data structures
- Isolate side effects in dedicated effects modules to keep business logic pure
- Use structured state objects with clear interfaces for type safety

## Testing
- No testing framework currently implemented; plan to add Vitest for unit and integration tests
- Write testable code: pure functions, dependency injection, and avoid global state in tests
- Test critical paths: IPC handlers, state updates, and UI interactions

## Debugging
- Use structured logging (Winston) instead of console.log for production-ready debugging
- For UI debugging, use React DevTools; for Electron, use DevTools in renderer process

## Maintainability and Readability
- Keep functions small and focused on single responsibilities
- Use descriptive names and add JSDoc comments for complex logic (when necessary)
- Follow DRY principle; extract reusable utilities
- Regularly refactor to reduce complexity and improve code flow

## Pending Improvements
- Add testing framework (Jest/Vitest) and write tests for core functionality
- Standardize error handling across async operations with consistent logging
- Add dedicated typecheck script for CI/CD

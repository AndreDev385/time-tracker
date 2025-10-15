# Problems in the codebase

- [x] Excessive console.log usage: 33+ instances across server files for debugging; replace with structured logging (e.g., Winston) for production.
- [x] Monolithic main.ts: 400+ lines handling IPC, intervals, and state; refactor into modules for maintainability.
- [x] Global state management: Variables like activeJourney and intervals stored globally; use a state manager or context.
- [x] Incomplete features: 6 TODOs in code (e.g., error handling, collision logic) indicate unfinished work.
- [x] No testing framework: Package.json lacks Jest/Mocha; add unit/integration tests for reliability.
- [x] Poor documentation: README is default Vite template; update with project-specific info.
- [x] Hardcoded values: Defaults like idle time (300s) scattered; centralize in config.
- [ ] Inconsistent error handling: Some async ops lack try-catch; standardize with proper logging.

# Improvements

- [x] Structured logging
- [x] Split logic in consistent modules

# Pending bugs

- [ ] Pausa por inactividad, cuando vuelves a iniciar jornada y tarea, cuenta
el tiempo de la tarea pero no el de la jornada

Tras esto al querer finalizar una jornada los controles del toolbar no hacen nada
han tenido que parar la jornada, volverla a iniciar para poder cerrar la tarea

- [ ] Al iniciar poner las ventanas en donde estaban al apagar el computador

- [ ] Que solo sea posible abrir una instancia de la app a la vez

- [ ] Usar la app con un servidor y db de pruebas en windows

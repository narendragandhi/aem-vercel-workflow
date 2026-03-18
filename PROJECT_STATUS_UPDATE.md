# AEMFlow Project - Status Update

## Summary
The repository contains a full React-based workflow builder in `ui.frontend/` and a Java/AEM backend in `core/`. The frontend is functional for local development, while backend integration and AEM packaging require verification and integration testing.

## Current Status

### Frontend (ui.frontend)
- Visual editor, simulator, analytics, and templates implemented in React/TypeScript.
- Unit tests and Playwright E2E configuration present.
- Build pipeline and CI now run from `ui.frontend/`.

### Backend (core)
- Services, models, and REST servlets implemented under `core/src/main/java`.
- AEM SDK API version set to `2023.12.13363.20231213T120324Z-231200` in `pom.xml`.
- Java target level is 21 (per parent POM).

## Risks / Gaps
- Frontend-backend API contract alignment must be validated in AEM.
- AEM content packages (`ui.apps`, `ui.content`, `dispatcher`, `it.tests`) still require real content and integration testing.

## Next Steps
1. Run full backend build and verify bundle activation in AEM.
2. Verify REST endpoints and update any remaining API contract mismatches.
3. Add integration tests covering workflow CRUD and execution.

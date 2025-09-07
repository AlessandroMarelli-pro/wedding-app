# Tasks: Ariane & Timothe Wedding Website MVP

**Input**: Design documents from `/specs/001-ariane-timoth-a/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Extract: NestJS + Next.js + SQLite + ShadCN tech stack
2. Load design documents ✅:
   → data-model.md: 8 entities (Admin, WeddingInfo, Accommodation, Guest, etc.)
   → contracts/: OpenAPI spec with 15+ endpoints
   → research.md: Technical decisions (JWT, bcrypt, Google Maps, etc.)
3. Generate MVP tasks focusing on browser-runnable version ✅
4. Apply TDD ordering and parallel execution rules ✅
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- MVP Focus: Core functionality for local browser demo

## Path Conventions
- **Web app structure**: `backend/src/`, `frontend/src/`
- Paths based on plan.md structure decision

## Phase 3.1: Project Setup
- [ ] T001 Create backend and frontend project structure with package.json files
- [ ] T002 Initialize NestJS backend with TypeScript, TypeORM, JWT, bcrypt dependencies
- [ ] T003 Initialize Next.js frontend with TypeScript, ShadCN, Tailwind CSS dependencies
- [ ] T004 [P] Configure ESLint and Prettier for both backend and frontend
- [ ] T005 [P] Create SQLite database connection configuration in backend/src/config/database.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests [P]
- [ ] T006 [P] Contract test POST /api/auth/login in backend/tests/contract/auth.test.ts
- [ ] T007 [P] Contract test GET /api/wedding in backend/tests/contract/wedding.test.ts
- [ ] T008 [P] Contract test GET /api/accommodations in backend/tests/contract/accommodations.test.ts
- [ ] T009 [P] Contract test POST /api/rsvp in backend/tests/contract/rsvp.test.ts
- [ ] T010 [P] Contract test POST /api/admin/guests/upload in backend/tests/contract/admin.test.ts

### Integration Tests [P]
- [ ] T011 [P] Integration test admin login flow in backend/tests/integration/auth-flow.test.ts
- [ ] T012 [P] Integration test CSV upload and hash generation in backend/tests/integration/csv-upload.test.ts
- [ ] T013 [P] Integration test RSVP submission with hash code in backend/tests/integration/rsvp-flow.test.ts
- [ ] T014 [P] Integration test wedding info management in backend/tests/integration/wedding-management.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Database Models [P]
- [ ] T015 [P] Admin entity in backend/src/entities/admin.entity.ts
- [ ] T016 [P] WeddingInfo entity in backend/src/entities/wedding-info.entity.ts
- [ ] T017 [P] Accommodation entity in backend/src/entities/accommodation.entity.ts
- [ ] T018 [P] Guest entity in backend/src/entities/guest.entity.ts
- [ ] T019 [P] RSVPConfirmation entity in backend/src/entities/rsvp-confirmation.entity.ts
- [ ] T020 [P] CSVUpload entity in backend/src/entities/csv-upload.entity.ts

### Services [P]
- [ ] T021 [P] AuthService with JWT and bcrypt in backend/src/services/auth.service.ts
- [ ] T022 [P] WeddingService for wedding info CRUD in backend/src/services/wedding.service.ts
- [ ] T023 [P] AccommodationService for recommendations CRUD in backend/src/services/accommodation.service.ts
- [ ] T024 [P] GuestService for CSV processing and hash generation in backend/src/services/guest.service.ts
- [ ] T025 [P] RSVPService for confirmation logic in backend/src/services/rsvp.service.ts

### API Controllers
- [ ] T026 AuthController POST /api/auth/login in backend/src/controllers/auth.controller.ts
- [ ] T027 WeddingController GET /api/wedding in backend/src/controllers/wedding.controller.ts
- [ ] T028 AccommodationController GET /api/accommodations in backend/src/controllers/accommodation.controller.ts
- [ ] T029 RSVPController POST /api/rsvp in backend/src/controllers/rsvp.controller.ts
- [ ] T030 AdminController CSV upload and management in backend/src/controllers/admin.controller.ts

### Frontend Pages [P]
- [ ] T031 [P] Landing page with SSR and wedding sections in frontend/src/pages/index.tsx
- [ ] T032 [P] RSVP form component in frontend/src/components/rsvp-form.tsx
- [ ] T033 [P] Admin login page in frontend/src/pages/admin/login.tsx
- [ ] T034 [P] Admin dashboard with CSV upload in frontend/src/pages/admin/dashboard.tsx
- [ ] T035 [P] Admin wedding management page in frontend/src/pages/admin/wedding.tsx

## Phase 3.4: Integration & Configuration
- [ ] T036 Database migrations and seeding in backend/src/migrations/
- [ ] T037 JWT authentication middleware in backend/src/middleware/auth.middleware.ts
- [ ] T038 CORS and security configuration in backend/src/main.ts
- [ ] T039 Frontend API service with Axios client in frontend/src/services/api.ts
- [ ] T040 Environment configuration files (.env templates)

## Phase 3.5: MVP Features
- [ ] T041 ShadCN UI components setup in frontend/src/components/ui/
- [ ] T042 Responsive layout with fixed image + scrollable content in frontend/src/components/layout.tsx
- [ ] T043 Wedding presentation section component in frontend/src/components/wedding-presentation.tsx
- [ ] T044 Accommodations list with basic styling in frontend/src/components/accommodations.tsx
- [ ] T045 Basic program/schedule display in frontend/src/components/wedding-program.tsx
- [ ] T046 CSV file upload interface in admin dashboard
- [ ] T047 Guest list display with generated hash codes in admin
- [ ] T048 RSVP confirmation list in admin dashboard

## Phase 3.6: Polish & Demo Preparation
- [ ] T049 [P] Error handling and user feedback messages
- [ ] T050 [P] Loading states for async operations
- [ ] T051 Demo data seeding with sample wedding info and accommodations
- [ ] T052 README.md with local development setup instructions
- [ ] T053 Smoke tests to verify MVP functionality
- [ ] T054 Mobile responsive styling verification

## Dependencies
**Critical Path**:
1. Setup (T001-T005) → Tests (T006-T014) → Core (T015-T035) → Integration (T036-T040) → MVP Features (T041-T048) → Polish (T049-T054)

**Blocking Relationships**:
- T001-T005 must complete before any other tasks
- T006-T014 (tests) must be written and failing before T015-T048 (implementation)
- T015-T020 (entities) must complete before T021-T025 (services)
- T021-T025 (services) must complete before T026-T030 (controllers)
- T036-T040 (integration) needed before T049-T054 (polish)

**Parallel Groups**:
- Tests: T006-T014 can run in parallel (different test files)
- Entities: T015-T020 can run in parallel (different entity files)
- Services: T021-T025 can run in parallel (different service files)
- Frontend pages: T031-T035 can run in parallel (different page files)

## Parallel Execution Examples

### Phase 1: Setup (can run some in parallel)
```bash
# Run together after T001-T003:
Task: "Configure ESLint and Prettier for backend in backend/.eslintrc.js"
Task: "Create SQLite database configuration in backend/src/config/database.ts"
```

### Phase 2: All Contract Tests (fully parallel)
```bash
Task: "Contract test POST /api/auth/login in backend/tests/contract/auth.test.ts"
Task: "Contract test GET /api/wedding in backend/tests/contract/wedding.test.ts"
Task: "Contract test GET /api/accommodations in backend/tests/contract/accommodations.test.ts"
Task: "Contract test POST /api/rsvp in backend/tests/contract/rsvp.test.ts"
Task: "Contract test POST /api/admin/guests/upload in backend/tests/contract/admin.test.ts"
```

### Phase 3: All Integration Tests (fully parallel)
```bash
Task: "Integration test admin login flow in backend/tests/integration/auth-flow.test.ts"
Task: "Integration test CSV upload and hash generation in backend/tests/integration/csv-upload.test.ts"
Task: "Integration test RSVP submission in backend/tests/integration/rsvp-flow.test.ts"
Task: "Integration test wedding info management in backend/tests/integration/wedding-management.test.ts"
```

### Phase 4: All Entities (fully parallel)
```bash
Task: "Create Admin entity in backend/src/entities/admin.entity.ts"
Task: "Create WeddingInfo entity in backend/src/entities/wedding-info.entity.ts"
Task: "Create Accommodation entity in backend/src/entities/accommodation.entity.ts"
Task: "Create Guest entity in backend/src/entities/guest.entity.ts"
Task: "Create RSVPConfirmation entity in backend/src/entities/rsvp-confirmation.entity.ts"
Task: "Create CSVUpload entity in backend/src/entities/csv-upload.entity.ts"
```

## MVP Success Criteria
✅ **Browser Demo Ready**: Can run locally with `npm run dev` (frontend) + `npm run start:dev` (backend)
✅ **Core Wedding Site**: Landing page shows wedding info, accommodations, RSVP form
✅ **Admin Panel**: Login, CSV upload, view guest list with hash codes, manage wedding content
✅ **RSVP System**: Guests can enter 8-character codes and confirm attendance
✅ **Data Persistence**: SQLite stores all data locally
✅ **Responsive**: Works on desktop and mobile browsers

## Notes
- MVP excludes: Google Maps integration, calendar export, image uploads, complex styling
- Focus on functional demo that can be run locally in browser
- All tests must fail before implementation (TDD)
- [P] tasks use different files and can run simultaneously
- Commit after each completed task for progress tracking
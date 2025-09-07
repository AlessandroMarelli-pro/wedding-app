# Implementation Plan: Ariane & Timothe Wedding Website

**Branch**: `001-ariane-timoth-a` | **Date**: 2025-09-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ariane-timoth-a/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Wedding website featuring guest presentation, RSVP management with 8-character hash codes generated from CSV uploads, accommodation recommendations with maps, calendar integration, and admin content management. Built as SPA for landing (with SSR) + SPA admin with NestJS API backend.

## Technical Context
**Language/Version**: TypeScript with Node.js 18+  
**Primary Dependencies**: NestJS (backend API), Next.js (frontend with SSR), ShadCN (design system)  
**Storage**: SQLite (local database)  
**Testing**: Jest for unit/integration tests, Cypress for E2E  
**Target Platform**: Web application (desktop and mobile responsive)
**Project Type**: web - determines frontend + backend structure  
**Performance Goals**: <500ms page load, <200ms API response times  
**Constraints**: SQLite limitations, Google Maps API integration, iCal format support  
**Scale/Scope**: Small wedding (~100-200 guests), content management for 1-2 admin users

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 2 (frontend, backend) ✅
- Using framework directly? Yes - NestJS/Next.js without wrappers ✅
- Single data model? Yes - TypeORM entities shared ✅
- Avoiding patterns? Yes - direct service injection, no Repository pattern ✅

**Architecture**:
- EVERY feature as library? No - wedding-specific application ❌
- Libraries listed: N/A - single-purpose app
- CLI per library: N/A - web application
- Library docs: N/A - application not library

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Yes - TDD workflow planned ✅
- Git commits show tests before implementation? Yes - required ✅
- Order: Contract→Integration→E2E→Unit strictly followed? Yes ✅
- Real dependencies used? Yes - actual SQLite database ✅
- Integration tests for: API contracts, CSV processing, authentication ✅
- FORBIDDEN: Implementation before test, skipping RED phase ✅

**Observability**:
- Structured logging included? Yes - NestJS logger with context ✅
- Frontend logs → backend? Yes - API error logging ✅
- Error context sufficient? Yes - stack traces + request context ✅

**Versioning**:
- Version number assigned? 1.0.0 (wedding event-specific) ✅
- BUILD increments on every change? Yes - semantic versioning ✅
- Breaking changes handled? Yes - API versioning plan ✅

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (Web application) - Frontend (Next.js SPA) + Backend (NestJS API)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh [claude|gemini|copilot]` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Database setup: TypeORM entities + migrations (8 entities)
- API contract tests: 15+ endpoints from OpenAPI spec
- NestJS services: Authentication, CSV processing, RSVP validation
- Next.js pages: Landing (SSR), Admin (SPA), RSVP form
- Integration features: Google Maps, calendar export, image upload

**Ordering Strategy**:
- TDD order: Contract tests → Integration tests → Implementation
- Dependency order: Database → API → Frontend
- Core features first: Auth → CSV upload → RSVP → Content management
- Mark [P] for parallel execution: Independent components and tests

**Estimated Output**: 30-35 numbered, ordered tasks covering:
- 8 database entity creation tasks
- 15 API endpoint test + implementation tasks  
- 6 frontend page/component tasks
- 5 integration tasks (maps, calendar, CSV, images)
- Performance and deployment tasks

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Not library-based architecture | Wedding-specific application with single deployment target | Library architecture adds unnecessary abstraction for event-specific website |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS (with documented deviation)
- [x] Post-Design Constitution Check: PASS (with documented deviation)
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
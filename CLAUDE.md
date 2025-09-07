# wedding-app Development Guidelines

Auto-generated from feature 001-ariane-timoth-a plan. Last updated: 2025-09-07

## Active Technologies
- TypeScript with Node.js 18+
- NestJS (backend API)
- Next.js (frontend with SSR)
- ShadCN/UI (design system)
- SQLite with TypeORM
- Jest for testing
- Google Maps API
- JWT authentication

## Project Structure
```
backend/
├── src/
│   ├── models/         # TypeORM entities
│   ├── services/       # Business logic
│   └── api/           # Controllers and routes
└── tests/
    ├── contract/      # API contract tests
    ├── integration/   # Integration tests  
    └── unit/          # Unit tests

frontend/
├── src/
│   ├── components/    # React components
│   ├── pages/         # Next.js pages
│   └── services/      # API client services
└── tests/
    └── e2e/          # Cypress E2E tests
```

## Development Commands
```bash
# Backend
npm run start:dev      # Development server
npm run test          # Run all tests
npm run test:contracts # API contract tests
npm run migration:run  # Run database migrations

# Frontend  
npm run dev           # Development server
npm run build         # Production build
npm run test:e2e      # End-to-end tests
```

## Code Style
- TypeScript strict mode enabled
- Follow NestJS decorators pattern (@Controller, @Service, etc.)
- Use TypeORM entities for data models
- ShadCN components for UI consistency
- ESLint + Prettier for code formatting

## API Patterns
- RESTful endpoints following OpenAPI spec
- JWT authentication for admin routes
- Request/response validation with class-validator
- Error handling with NestJS exception filters
- File uploads with Multer middleware

## Database Guidelines
- Use TypeORM entities with decorators
- UUID primary keys for all entities
- Proper foreign key relationships
- Database migrations for schema changes
- Seed data for initial admin account

## Testing Requirements
- TDD approach: tests before implementation
- Contract tests for all API endpoints
- Integration tests for database operations
- E2E tests for complete user stories
- Real database connections (no mocks)

## Recent Changes
- 001-ariane-timoth-a: Added wedding website with RSVP system, CSV uploads, admin panel

<!-- MANUAL ADDITIONS START -->
<!-- Add any manual context here - it will be preserved during updates -->
<!-- MANUAL ADDITIONS END -->
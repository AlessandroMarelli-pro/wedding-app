# Phase 0: Research & Technical Decisions

## Research Findings

### NestJS + TypeScript + SQLite Stack

**Decision**: NestJS with TypeScript and SQLite  
**Rationale**: 
- NestJS provides enterprise-grade structure with decorators and dependency injection
- TypeScript ensures type safety across frontend/backend
- SQLite perfect for small-scale wedding site with minimal concurrency needs
- Built-in support for validation, guards, and middleware

**Alternatives considered**: Express.js (too minimal), Fastify (less ecosystem), PostgreSQL (overkill for scale)

### Frontend Architecture: Next.js with SSR

**Decision**: Next.js with SSR for landing page, SPA behavior for admin  
**Rationale**: 
- SSR improves SEO and initial load performance for guest-facing content
- SPA behavior for admin provides better UX for content management
- Built-in API routes can complement NestJS backend
- Excellent TypeScript integration

**Alternatives considered**: Vite + React (no SSR), Nuxt.js (Vue ecosystem), Create React App (deprecated)

### Design System: ShadCN/UI

**Decision**: ShadCN/UI components with Tailwind CSS  
**Rationale**: 
- Copy-paste component architecture allows customization
- Built on Radix UI primitives for accessibility
- Tailwind CSS for responsive design
- TypeScript-first approach

**Alternatives considered**: Material-UI (heavy), Chakra UI (different styling approach), Ant Design (enterprise-focused)

### CSV Processing & Hash Generation

**Decision**: Papa Parse for CSV handling + crypto.randomBytes for hash generation  
**Rationale**: 
- Papa Parse handles CSV edge cases (quotes, newlines, encodings)
- Node.js crypto module provides cryptographically secure random generation
- 8-character alphanumeric codes balance security with usability

**Alternatives considered**: Native CSV parsing (error-prone), UUID (too long), sequential IDs (predictable)

### Map Integration: Google Maps

**Decision**: Google Maps JavaScript API with @googlemaps/js-api-loader  
**Rationale**: 
- Most comprehensive mapping service with Places API
- Good documentation and TypeScript support
- Integration with accommodation search/recommendations

**Alternatives considered**: OpenStreetMap + Leaflet (no business data), Mapbox (complex pricing)

### Calendar Integration: iCal Format

**Decision**: Generate .ics files using ical-generator library  
**Rationale**: 
- Universal format supported by all major calendar applications
- No API dependencies or OAuth flows required
- Simple download mechanism

**Alternatives considered**: Google Calendar API (requires OAuth), direct calendar app links (limited compatibility)

### Authentication: JWT + bcrypt

**Decision**: JWT tokens with bcrypt password hashing  
**Rationale**: 
- Simple email/password authentication as specified
- Stateless tokens work well with SPA architecture
- bcrypt provides secure password hashing

**Alternatives considered**: Sessions (require server state), OAuth (overcomplicated for single admin)

### File Upload: Multer + Sharp

**Decision**: Multer for file uploads + Sharp for image processing  
**Rationale**: 
- Multer integrates well with NestJS
- Sharp for image resizing/optimization
- Local file storage sufficient for wedding site scale

**Alternatives considered**: Cloud storage (AWS S3, Cloudinary) - unnecessary complexity for scope

### Database Schema Design

**Decision**: SQLite with TypeORM  
**Rationale**: 
- TypeORM provides good TypeScript integration and migration support
- SQLite file-based storage is simple for deployment
- Sufficient for wedding guest list scale (~100-200 records)

**Alternatives considered**: Prisma (good but adds complexity), Raw SQL (maintenance burden)

## Resolved Clarifications

All NEEDS CLARIFICATION items from spec have been resolved with concrete technical decisions:

1. **Authentication method**: Email/password with JWT tokens
2. **CSV structure**: firstname, lastname, email (optional) format
3. **Calendar integration**: iCal (.ics) format files
4. **Map service**: Google Maps JavaScript API

## Integration Points

1. **Frontend ↔ Backend**: REST API with TypeScript shared types
2. **CSV Processing**: Server-side validation and hash generation
3. **File Uploads**: Images stored locally with Sharp processing
4. **Google Maps**: Client-side integration with accommodation data from API
5. **Calendar Export**: Server-generated .ics files for download

## Performance Considerations

- SSR for initial page load optimization
- Image optimization with Sharp
- SQLite query optimization for guest lookups
- Responsive design for mobile devices
- Google Maps lazy loading

## Security Measures

- Input validation on all API endpoints
- CORS configuration for frontend/backend communication
- bcrypt password hashing with salt rounds
- File upload validation (type, size limits)
- Hash code uniqueness validation
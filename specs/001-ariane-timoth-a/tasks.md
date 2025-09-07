# Tasks: Ariane & Timothe Wedding Website - Remaining Features

**Input**: Design documents from `/specs/001-ariane-timoth-a/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

**Context**: MVP has been implemented. Need to implement remaining features:
- Admin accommodation management  
- Admin image upload functionality
- Enhanced RSVP form with party size and dietary preferences
- Email notifications
- Calendar export improvements
- Admin analytics and reporting

## Execution Flow (remaining)
Based on analysis of current implementation, the following features need to be completed:

## Phase 3.1: Admin Features - Missing Components

- [ ] T001 [P] Admin accommodations management page in frontend/src/pages/admin/accommodations.tsx
- [ ] T002 [P] Image upload service in backend/src/services/image.service.ts  
- [ ] T003 [P] Admin image management controller routes in backend/src/controllers/admin.controller.ts
- [ ] T004 [P] Frontend image upload component in frontend/src/components/image-upload.tsx

## Phase 3.2: Enhanced RSVP System

- [ ] T005 Update Guest entity to include party size and dietary restrictions (already done - verify)
- [ ] T006 [P] Enhanced RSVP form with party details in frontend/src/components/rsvp-form.tsx
- [ ] T007 [P] RSVP service updates for party size handling in backend/src/services/rsvp.service.ts
- [ ] T008 Update RSVP controller to handle enhanced data in backend/src/controllers/rsvp.controller.ts

## Phase 3.3: File Upload & Image Management

- [ ] T009 [P] Multer file upload configuration in backend/src/config/upload.ts
- [ ] T010 [P] Image resizing service using Sharp in backend/src/services/image.service.ts
- [ ] T011 [P] Upload directory structure and permissions setup
- [ ] T012 [P] Static file serving configuration in backend/src/main.ts

## Phase 3.4: CSV Processing Enhancements

- [ ] T013 [P] Extended CSV validation for new fields (phoneNumber, partySize, dietaryRestrictions, specialRequests)
- [ ] T014 [P] CSV upload error reporting improvements in backend/src/services/guest.service.ts
- [ ] T015 Update admin guests page to show new field data (partially done - verify display)

## Phase 3.5: Calendar Integration Improvements

- [ ] T016 [P] iCal generation service in backend/src/services/calendar.service.ts
- [ ] T017 [P] Enhanced program events with location and description in backend/src/entities/program-event.entity.ts
- [ ] T018 Program calendar download endpoint in backend/src/controllers/program.controller.ts
- [ ] T019 [P] Frontend calendar download component in frontend/src/components/calendar-download.tsx

## Phase 3.6: Email Notifications (Optional Enhancement)

- [ ] T020 [P] Email service configuration in backend/src/services/email.service.ts
- [ ] T021 [P] RSVP confirmation email templates
- [ ] T022 [P] Admin notification system for new RSVPs
- [ ] T023 Email service integration in RSVP controller

## Phase 3.7: Analytics and Reporting

- [ ] T024 [P] RSVP analytics service in backend/src/services/analytics.service.ts
- [ ] T025 [P] Admin dashboard statistics component in frontend/src/components/admin-stats.tsx
- [ ] T026 [P] Guest export functionality (CSV download)
- [ ] T027 Analytics API endpoints in backend/src/controllers/admin.controller.ts

## Phase 3.8: Google Maps Integration

- [ ] T028 [P] Google Maps API service in frontend/src/services/maps.service.ts
- [ ] T029 [P] Interactive map component for accommodations in frontend/src/components/maps/accommodation-map.tsx
- [ ] T030 Wedding location map integration in frontend/src/components/maps/venue-map.tsx
- [ ] T031 [P] Maps configuration and API key validation

## Phase 3.9: Mobile Optimization and Performance

- [ ] T032 [P] Responsive design improvements for mobile devices
- [ ] T033 [P] Image optimization and lazy loading
- [ ] T034 [P] PWA configuration for offline access
- [ ] T035 Performance monitoring and optimization

## Phase 3.10: Testing and Documentation

- [ ] T036 [P] API contract tests for new endpoints in backend/tests/contract/
- [ ] T037 [P] Integration tests for image upload in backend/tests/integration/
- [ ] T038 [P] E2E tests for admin accommodations management in frontend/tests/e2e/
- [ ] T039 [P] E2E tests for enhanced RSVP flow in frontend/tests/e2e/
- [ ] T040 Update API documentation for new endpoints

## Dependencies

**Core Dependencies**:
- T001 requires accommodations entity and service (already exists)
- T002, T003, T004 can run in parallel (different files)
- T006 depends on T005 (entity updates)
- T009, T010, T011, T012 form upload infrastructure
- T016, T017, T018, T019 form calendar system

**Sequential Dependencies**:
- T008 after T007 (same service file)
- T018 after T016 (calendar service needed)
- T022, T023 after T020 (email service foundation)
- T025, T027 after T024 (analytics service foundation)
- T029, T030 after T028 (maps service foundation)

**Testing Dependencies**:
- T036-T040 should run after corresponding implementation tasks complete

## Parallel Execution Examples

```bash
# Phase 3.1 - Admin Features (can run together):
Task: "Admin accommodations management page in frontend/src/pages/admin/accommodations.tsx"
Task: "Image upload service in backend/src/services/image.service.ts"  
Task: "Admin image management controller routes in backend/src/controllers/admin.controller.ts"
Task: "Frontend image upload component in frontend/src/components/image-upload.tsx"

# Phase 3.3 - File Upload System (can run together):
Task: "Multer file upload configuration in backend/src/config/upload.ts"
Task: "Image resizing service using Sharp in backend/src/services/image.service.ts"
Task: "Upload directory structure and permissions setup"
Task: "Static file serving configuration in backend/src/main.ts"

# Phase 3.5 - Calendar System (can run together):
Task: "iCal generation service in backend/src/services/calendar.service.ts"
Task: "Enhanced program events with location in backend/src/entities/program-event.entity.ts"
Task: "Frontend calendar download component in frontend/src/components/calendar-download.tsx"
```

## Task Validation Checklist

**Implementation Status Verified:**
- [x] Guest entity with enhanced fields (phoneNumber, partySize, dietaryRestrictions, specialRequests)
- [x] Basic RSVP system working
- [x] Admin guest management with search and filtering
- [x] CSV upload processing with validation
- [x] Wedding info, accommodations, and program management
- [x] Authentication system

**Missing Components Identified:**
- [ ] Admin accommodations management page
- [ ] Image upload and management system
- [ ] Enhanced RSVP form with party details
- [ ] Calendar export (.ics file generation)
- [ ] Google Maps integration
- [ ] Analytics and reporting dashboard
- [ ] Email notifications
- [ ] Comprehensive testing coverage

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- Focus on high-impact features first: admin accommodations, image uploads, enhanced RSVP
- Calendar and maps integration are secondary priorities
- Email notifications are optional enhancements
- All tasks should maintain existing functionality
- No TDD requirement as specified in context

**Current State:** MVP functional, need to complete administrative features and user experience enhancements for production deployment.
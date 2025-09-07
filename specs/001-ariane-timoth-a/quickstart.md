# Quickstart Guide

## Development Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

### 1. Clone and Setup
```bash
git checkout 001-ariane-timoth-a
npm install
```

### 2. Environment Configuration
```bash
# Backend environment (.env)
DATABASE_URL=file:./database.sqlite
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
UPLOAD_DIR=./uploads
CORS_ORIGIN=http://localhost:3000

# Frontend environment (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 3. Database Setup
```bash
cd backend
npm run migration:run
npm run seed:admin  # Creates default admin account
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend API (port 3001)
cd backend
npm run start:dev

# Terminal 2 - Frontend (port 3000)
cd frontend  
npm run dev
```

### 5. Access Applications
- **Public Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Documentation**: http://localhost:3001/api/docs (Swagger)

## User Story Validation Tests

### Story 1: Guest Views Wedding Information
**Test Steps:**
1. Navigate to http://localhost:3000
2. Verify presentation section displays couple names and message
3. Verify wedding program section shows events
4. Verify location section shows directions
5. Verify accommodations section displays recommendations with map
6. Verify responsive design on mobile (F12 → device toolbar)

**Expected Result:** All sections display properly with responsive layout

### Story 2: CSV Upload and Hash Code Generation
**Test Steps:**
1. Create test CSV file:
   ```csv
   firstname,lastname,email
   John,Doe,john@example.com
   Jane,Smith,jane@example.com
   Bob,Johnson,
   ```
2. Login to admin panel (http://localhost:3000/admin)
3. Navigate to Guests section
4. Upload CSV file
5. Verify processing status and success message
6. Check generated hash codes are 8 characters, alphanumeric
7. Verify guest list shows imported guests

**Expected Result:** CSV processes successfully with unique hash codes generated

### Story 3: Guest RSVP with Hash Code
**Test Steps:**
1. From admin panel, copy a guest's hash code
2. Navigate to public website (http://localhost:3000)  
3. Click RSVP button
4. Enter the hash code
5. Submit RSVP form
6. Verify confirmation message shows guest name
7. Try submitting same code again (should fail)
8. Try invalid code (should fail with error)

**Expected Result:** Valid codes confirm RSVP, invalid/duplicate codes show errors

### Story 4: Admin Content Management
**Test Steps:**
1. Login to admin panel
2. Edit wedding information (couple names, message, address)
3. Save changes and verify on public site
4. Upload an image
5. Add new accommodation with location
6. Verify map shows accommodation marker
7. Reorder accommodations using display order

**Expected Result:** All content changes reflect immediately on public site

### Story 5: Calendar Integration
**Test Steps:**
1. View wedding program on public site
2. Click "Add to Calendar" button
3. Verify .ics file downloads
4. Open .ics file in calendar app (Outlook, Apple Calendar, etc.)
5. Verify events appear with correct dates, times, and locations

**Expected Result:** Calendar events import successfully with all details

## Integration Test Scenarios

### API Contract Tests
```bash
cd backend
npm run test:contracts  # Validates OpenAPI spec compliance
```

### End-to-End Tests  
```bash
cd frontend
npm run test:e2e  # Cypress tests covering user stories
```

### Database Tests
```bash
cd backend
npm run test:db  # Tests migrations, seeds, and constraints
```

## Performance Validation

### Page Load Times
- Public homepage: < 2 seconds (3G connection)
- Admin login: < 1 second (after credentials entered)
- CSV upload processing: < 5 seconds for 200 guests

### API Response Times
```bash
# Load test with Apache Bench
ab -n 100 -c 10 http://localhost:3001/api/wedding
ab -n 50 -c 5 http://localhost:3001/api/accommodations
```

**Expected:** All endpoints < 200ms average response time

### Mobile Performance
1. Open Chrome DevTools
2. Set network throttling to "Slow 3G"
3. Set CPU throttling to "4x slowdown"
4. Test all user stories on mobile viewport
5. Verify functionality remains intact

## Common Issues & Solutions

### Database Connection Issues
```bash
# Reset database
rm backend/database.sqlite
npm run migration:run
npm run seed:admin
```

### CORS Errors
- Verify CORS_ORIGIN in backend .env matches frontend URL
- Check both servers are running on correct ports

### Google Maps Not Loading
- Verify GOOGLE_MAPS_API_KEY in both environments
- Check API key has JavaScript Maps API enabled
- Verify billing account is set up (required for Google Maps)

### CSV Upload Fails
- Check file format: UTF-8 encoding, .csv extension
- Verify headers: firstname, lastname, email (case-insensitive)
- Ensure no empty rows or invalid characters

### Hash Code Generation Issues
- Check uniqueness constraints in database
- Verify crypto module is available (Node.js built-in)
- Review error logs for collision handling

## Production Deployment

### Build Commands
```bash
# Backend build
cd backend
npm run build

# Frontend build  
cd frontend
npm run build
```

### Environment Variables
```bash
# Production backend
DATABASE_URL=file:/var/data/wedding.sqlite
JWT_SECRET=production-secret-key
GOOGLE_MAPS_API_KEY=production-api-key
NODE_ENV=production

# Production frontend
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=production-api-key
```

### Health Checks
- GET /api/health (backend health)
- GET / (frontend accessibility)
- Database connectivity test
- File upload directory permissions

### Monitoring
- API response times and error rates
- Database query performance
- Image upload success rates
- RSVP confirmation rates

## Development Workflow

### Making Changes
1. All changes require failing tests first (TDD)
2. Update contracts if API changes
3. Run integration tests before committing
4. Update this quickstart if new features added

### Code Quality
```bash
npm run lint      # ESLint for code style
npm run type-check # TypeScript type checking  
npm run test      # Unit and integration tests
```

This quickstart validates all acceptance scenarios from the specification and provides a complete development and deployment workflow.
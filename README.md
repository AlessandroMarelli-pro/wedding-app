# Ariane & Timothe Wedding Website

A modern wedding website built with Next.js and NestJS featuring guest management, RSVP system with hash codes, and admin content management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone and install dependencies:**
```bash
git checkout 001-ariane-timoth-a
```

2. **Backend setup:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

3. **Frontend setup:**
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

### Development

1. **Start backend server (Terminal 1):**
```bash
cd backend
npm run start:dev
```

2. **Start frontend server (Terminal 2):**
```bash
cd frontend
npm run dev
```

3. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Admin Panel: http://localhost:3000/admin

## 📁 Project Structure

```
wedding-app/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── entities/       # TypeORM entities
│   │   ├── services/       # Business logic
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── config/         # Configuration files
│   │   └── migrations/     # Database migrations
│   └── tests/              # Backend tests
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── pages/          # Next.js pages
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── styles/         # CSS styles
│   └── tests/              # Frontend tests
└── specs/                  # Project specifications
```

## 🛠️ Tech Stack

### Updated to Latest Versions (December 2024)

**Backend:**
- NestJS ^10.4.8
- TypeScript ^5.7.2
- TypeORM ^0.3.21
- SQLite ^5.1.7
- JWT ^10.2.0
- bcrypt ^5.1.1
- ESLint ^8.57.1

**Frontend:**
- Next.js ^15.1.2
- React ^19.0.0
- TypeScript ^5.7.2
- ShadCN/UI components
- Tailwind CSS ^3.4.17
- Axios ^1.7.9
- ESLint ^9.17.0

**Testing & Development:**
- Jest ^29.7.0
- Cypress ^13.16.1
- Prettier ^3.4.2

## 📋 Features

### MVP Features (Phase 3.1 Complete)
✅ Project structure and configuration  
✅ NestJS backend with TypeScript  
✅ Next.js frontend with ShadCN/UI  
✅ SQLite database connection  
✅ ESLint and Prettier setup  
✅ **Updated to latest package versions**

### Upcoming Features
- [ ] Database entities and migrations
- [ ] Admin authentication system  
- [ ] CSV upload and guest management
- [ ] RSVP system with 8-character hash codes
- [ ] Wedding information management
- [ ] Accommodation recommendations
- [ ] Responsive design
- [ ] Google Maps integration (future)
- [ ] Calendar export (future)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test              # Unit tests
npm run test:e2e         # End-to-end tests
npm run test:contracts   # Contract tests

# Frontend tests  
cd frontend
npm run test             # Unit tests
npm run test:e2e         # Cypress E2E tests
```

## 📝 Development Workflow

1. Follow TDD: Write tests first, then implementation
2. Use conventional commits
3. Run linting before commits: `npm run lint`
4. Commit after each completed task

## 🚀 Deployment

### Build for production:
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
npm run start
```

### Environment Variables
- Copy `.env.example` files and configure for your environment
- Generate secure JWT secrets for production
- Set up proper CORS origins

## ⚠️ Version Compatibility Notes

The project has been updated to use the latest stable versions as of December 2024:
- React 19 with improved hooks and concurrent features
- Next.js 15 with enhanced performance and bundling
- NestJS 10 with latest decorators and DI improvements
- TypeScript 5.7 with improved type inference
- ESLint 9 with flat config support (backend uses legacy format for compatibility)

## 📖 API Documentation

Once the backend is running, API documentation will be available at:
http://localhost:3001/api/docs (Swagger - coming soon)

## 🤝 Contributing

This is a private wedding website project. See `specs/001-ariane-timoth-a/tasks.md` for the complete implementation roadmap.

## 📄 License

Private project for Ariane & Timothe's wedding.
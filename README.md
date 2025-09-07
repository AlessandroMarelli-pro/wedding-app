# 💒 Wedding Website - Ariane & Timothe

A beautiful, modern wedding website built with Next.js and NestJS, featuring guest management, RSVP system, and admin dashboard.

## ✨ Features

### 🎯 **For Guests**

- **Beautiful Landing Page** with hero image and wedding details
- **Wedding Program** with timeline and calendar export (.ics)
- **Accommodations** with maps integration and recommendations
- **RSVP System** using unique 8-character hash codes
- **Mobile Responsive** design for all devices

### 🔧 **For Administrators**

- **Admin Dashboard** with RSVP statistics and recent confirmations
- **CSV Upload** for guest list management with auto-generated hash codes
- **Wedding Info Management** - edit details, dates, locations
- **Program Management** - create, edit, and reorder wedding events
- **Accommodations Management** - manage hotel recommendations
- **Guest List** with hash codes and RSVP status

### 🚀 **Technical Features**

- **Full-Stack TypeScript** application
- **SQLite Database** for easy local development
- **JWT Authentication** for admin security
- **ShadCN UI** with Neutral theme
- **Error Boundaries** and toast notifications
- **Calendar Export** in standard iCalendar format
- **Responsive Design** with Tailwind CSS

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.17.0 or higher)
- **npm** (v8.0.0 or higher)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd wedding-app
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment

Create `.env` file in the `backend/` directory:

```bash
cd backend
cp env.template .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_PATH=./wedding.db

# JWT Secret (change in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Origins (adjust for production)
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Environment

Create `.env.local` file in the `frontend/` directory:

```bash
cd ../frontend
cp env.template .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Database Setup

The application uses SQLite with TypeORM. The database will be automatically created when you start the backend.

```bash
cd backend
npm run build
npm run start:dev
```

The migrations will run automatically and seed the database with:

- Default admin user (email: `admin@wedding.com`, password: `admin123`)
- Sample wedding information
- Sample accommodations
- Sample program events

### 5. Start the Application

#### Terminal 1 - Backend API

```bash
cd backend
npm run start:dev
```

API will be available at: http://localhost:3001

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Website will be available at: http://localhost:3000

## 📱 Usage

### Public Website

1. Visit http://localhost:3000
2. Browse wedding information, program, and accommodations
3. Use RSVP with an 8-character hash code (sample codes available in admin)

### Admin Dashboard

1. Visit http://localhost:3000/admin/login
2. Login with:
   - **Email**: `admin@wedding.com`
   - **Password**: `admin123`
3. Access dashboard, manage content, upload guest lists

## 📁 Project Structure

```
wedding-app/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── controllers/     # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── entities/        # Database models
│   │   ├── migrations/      # Database migrations
│   │   └── guards/          # Authentication guards
│   ├── uploads/             # File uploads
│   └── wedding.db          # SQLite database
├── frontend/               # Next.js web application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Next.js pages
│   │   ├── styles/         # CSS styles
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
└── specs/                  # Project documentation
```

## 🛠 Development Commands

### Backend

```bash
cd backend

# Development with hot reload
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm run test

# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run
```

### Frontend

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📊 API Documentation

When running in development mode, Swagger API documentation is available at:
http://localhost:3001/api/docs

### Key Endpoints

#### Public Endpoints

- `GET /api/wedding` - Get wedding information
- `GET /api/accommodations` - Get accommodations list
- `GET /api/program` - Get wedding program events
- `GET /api/program/calendar` - Download calendar (.ics)
- `POST /api/rsvp` - Submit RSVP with hash code

#### Admin Endpoints (JWT Required)

- `POST /api/auth/login` - Admin login
- `GET /admin/rsvp/stats` - RSVP statistics
- `POST /admin/guests/upload` - Upload CSV guest list
- `PUT /admin/wedding` - Update wedding information
- Full CRUD for accommodations, program events

## 🎨 Customization

### Styling

The application uses Tailwind CSS with a custom design system:

- **Theme**: Neutral colors with rose/pink accents
- **Components**: ShadCN UI component library
- **Fonts**: Serif for headings, sans-serif for body text

### Wedding Content

All content is manageable through the admin dashboard:

1. **Wedding Info**: Date, location, couple names, message
2. **Program**: Add/edit/reorder wedding events
3. **Accommodations**: Hotel recommendations with maps
4. **Guest Management**: CSV upload with auto-generated codes

## 🚨 Troubleshooting

### Common Issues

#### Database Issues

```bash
# Reset database (will lose all data)
cd backend
rm wedding.db
npm run start:dev  # Will recreate with seed data
```

#### Port Conflicts

- Backend default: 3001
- Frontend default: 3000
- Change ports in `.env` files if needed

#### CORS Issues

- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Default: `http://localhost:3000`

#### Node Version Issues

- Ensure Node.js v18.17.0 or higher
- Use `node --version` to check

### Getting Help

1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure both backend and frontend are running
4. Check that ports 3000 and 3001 are available

## 📝 Sample Data

The application includes comprehensive demo data for testing:

### Admin Login

- **Email**: `admin@wedding.com`
- **Password**: `admin123`

### Sample RSVP Hash Codes

Test the RSVP functionality with these codes:

| Hash Code  | Guest Name    | Party Size | Status       |
| ---------- | ------------- | ---------- | ------------ |
| `DEMO2024` | Emma Johnson  | 2          | ✅ Confirmed |
| `FAMILY01` | Michael Smith | 4          | ✅ Confirmed |
| `COUPLE99` | Sarah Davis   | 2          | ❌ Declined  |
| `FRIEND42` | James Wilson  | 1          | ⏳ Pending   |
| `COLLEGE8` | Lisa Brown    | 3          | ✅ Confirmed |
| `WORK2023` | David Miller  | 2          | ⏳ Pending   |
| `BESTMAN1` | Alex Thompson | 1          | ✅ Confirmed |
| `COUSIN77` | Marie Dubois  | 3          | ⏳ Pending   |

### Demo Content

- **Wedding**: Ariane & Timothe, June 15, 2024
- **Venue**: Château de Malmaison, France
- **Program**: 4 events from ceremony to reception
- **Accommodations**: 4 options including hotels and Airbnb
- **Guests**: 8 sample guests with various RSVP statuses
- **Statistics**: Realistic dashboard data for testing

### Refreshing Demo Data

```bash
cd backend
npm run seed:demo
```

## 🚀 Production Deployment

### Environment Variables

Update production environment variables:

- Change `JWT_SECRET` to a secure random string
- Set `NODE_ENV=production`
- Update `CORS_ORIGIN` to your production domain
- Configure proper database path

### Build Commands

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run start
```

### Database

For production, consider migrating from SQLite to PostgreSQL or MySQL for better performance and concurrent access.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy Wedding Planning!** 💕

For questions or support, please check the documentation in the `/specs` directory or create an issue in the repository.

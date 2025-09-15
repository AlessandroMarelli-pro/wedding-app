# PostgreSQL Setup Guide

This guide will help you set up PostgreSQL for the wedding application migration.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed locally or access to a PostgreSQL server

## Installation

### macOS (using Homebrew)

```bash
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows

Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)

## Database Setup

### 1. Create Environment File

```bash
cp env.template .env
```

### 2. Configure Database Connection

Edit `.env` file with your PostgreSQL credentials:

```env
POSTGRES_PRISMA_URL="postgresql://username:password@localhost:5432/wedding_db"
```

### 3. Create Database

```bash
node scripts/create-database.js
```

### 4. Run Prisma Migration

```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Setup Initial Data

```bash
node scripts/setup-postgresql-fresh.js
```

## Verification

### Test Database Connection

```bash
npx prisma db pull
```

### Test API Endpoints

```bash
# Start the development server
npm run dev

# Test health endpoint
curl http://localhost:3000/api/health

# Test wedding info endpoint
curl http://localhost:3000/api/wedding/info
```

## Default Credentials

After setup, you can login with:

- **Email**: `admin@wedding.com`
- **Password**: `admin123`

## Troubleshooting

### Connection Issues

- Ensure PostgreSQL is running: `brew services list | grep postgresql`
- Check connection string format in `.env`
- Verify database exists: `psql -l`

### Permission Issues

- Ensure user has CREATE DATABASE privileges
- Check PostgreSQL authentication settings

### Port Conflicts

- Default PostgreSQL port is 5432
- Check if port is available: `lsof -i :5432`

## Production Deployment

### Vercel Deployment

1. Set up PostgreSQL database (e.g., Supabase, Railway, Neon)
2. Add `POSTGRES_PRISMA_URL` environment variable in Vercel dashboard
3. Deploy application

### Environment Variables for Production

```env
POSTGRES_PRISMA_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-production-secret-key"
DEFAULT_ADMIN_EMAIL="your-admin@email.com"
DEFAULT_ADMIN_PASSWORD="your-secure-password"
```

## Database Schema

The migration includes these main entities:

- **WeddingInfo**: Wedding details and configuration
- **Admin**: Administrator accounts
- **Guest**: Guest information and RSVP data
- **RSVPConfirmation**: RSVP responses
- **Accommodation**: Hotel and accommodation options
- **ProgramEvent**: Wedding program events
- **CSVUpload**: Guest list upload tracking
- **UploadedImage**: Image management

## Next Steps

After successful setup:

1. Test authentication endpoints
2. Verify all API routes work
3. Test frontend integration
4. Deploy to production

## Support

If you encounter issues:

1. Check PostgreSQL logs: `tail -f /usr/local/var/log/postgres.log`
2. Verify environment variables
3. Test database connection manually
4. Check Prisma migration status

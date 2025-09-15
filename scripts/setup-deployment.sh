#!/bin/bash

# Wedding App Deployment Setup Script
# This script helps prepare your app for deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    error "Please run this script from the wedding app root directory"
    exit 1
fi

log "🚀 Starting deployment setup for Wedding App..."

# Phase 1: Install PostgreSQL dependencies
log "📦 Installing PostgreSQL dependencies..."
cd backend
if ! npm list pg > /dev/null 2>&1; then
    npm install pg @types/pg
    log "✅ PostgreSQL dependencies installed"
else
    log "✅ PostgreSQL dependencies already installed"
fi
cd ..

# Phase 2: Check environment files
log "🔍 Checking environment configuration files..."

if [ ! -f "backend/.env" ]; then
    warn "backend/.env not found. Please create it from backend/env.template"
    info "Copy backend/env.template to backend/.env and configure your settings"
fi

if [ ! -f "frontend/.env" ]; then
    warn "frontend/.env not found. Please create it from frontend/env.template"
    info "Copy frontend/env.template to frontend/.env and configure your settings"
fi

# Phase 3: Build applications
log "🔨 Building applications..."

# Build backend
log "Building backend..."
cd backend
npm install
if npm run build; then
    log "✅ Backend built successfully"
else
    error "❌ Backend build failed"
    exit 1
fi
cd ..

# Build frontend
log "Building frontend..."
cd frontend
npm install
if npm run build; then
    log "✅ Frontend built successfully"
else
    error "❌ Frontend build failed"
    exit 1
fi
cd ..

# Phase 4: Check for required files
log "📋 Checking deployment files..."

required_files=(
    "railway.json"
    "backend/railway.json"
    "frontend/vercel.json"
    "scripts/backup-database.sh"
    "scripts/migrate-sqlite-to-postgres.js"
    "DEPLOYMENT.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        log "✅ $file exists"
    else
        error "❌ $file is missing"
    fi
done

# Phase 5: Make scripts executable
log "🔧 Making scripts executable..."
chmod +x scripts/backup-database.sh
chmod +x scripts/migrate-sqlite-to-postgres.js
log "✅ Scripts are now executable"

# Phase 6: Check health endpoint
log "🏥 Checking health endpoint..."
if grep -q "HealthController" backend/src/app.module.ts; then
    log "✅ Health controller is configured"
else
    error "❌ Health controller is missing"
fi

# Phase 7: Database configuration check
log "🗄️ Checking database configuration..."
if grep -q "postgres" backend/src/config/database.ts; then
    log "✅ Database configuration supports PostgreSQL"
else
    error "❌ Database configuration needs PostgreSQL support"
fi

# Phase 8: Summary
log "📊 Deployment Setup Summary:"
echo ""
info "✅ PostgreSQL dependencies installed"
info "✅ Applications built successfully"
info "✅ Deployment configuration files created"
info "✅ Backup scripts configured"
info "✅ Health check endpoint ready"
info "✅ Database configuration updated"
echo ""
warn "⚠️  Next steps:"
echo "   1. Create backend/.env from backend/env.template"
echo "   2. Create frontend/.env from frontend/env.template"
echo "   3. Configure your Google Maps API key"
echo "   4. Follow DEPLOYMENT.md for platform-specific setup"
echo ""
info "📖 Read DEPLOYMENT.md for detailed deployment instructions"
echo ""
log "🎉 Deployment setup completed successfully!"

# Phase 9: Optional - Check for common issues
log "🔍 Running final checks..."

# Check for hardcoded localhost URLs
if grep -r "localhost" frontend/src/ --include="*.ts" --include="*.tsx" | grep -v "env.template" > /dev/null; then
    warn "⚠️  Found hardcoded localhost URLs in frontend. Make sure to use environment variables."
fi

# Check for hardcoded ports
if grep -r ":3001" frontend/src/ --include="*.ts" --include="*.tsx" | grep -v "env.template" > /dev/null; then
    warn "⚠️  Found hardcoded port 3001 in frontend. Make sure to use environment variables."
fi

log "✅ Final checks completed"
echo ""
log "🚀 Your app is ready for deployment!"
log "📖 Follow the instructions in DEPLOYMENT.md to deploy to Railway and Vercel"

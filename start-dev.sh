#!/bin/bash

# Wedding App Development Startup Script
# Starts both backend and frontend in parallel

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to cleanup background processes on exit
cleanup() {
    print_status "Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the wedding-app root directory"
    exit 1
fi

print_status "Starting Wedding App Development Environment..."
echo ""

# Check if node_modules exist
if [ ! -d "backend/node_modules" ]; then
    print_warning "Backend dependencies not found. Installing..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    print_warning "Frontend dependencies not found. Installing..."
    cd frontend
    npm install
    cd ..
fi

# Start backend
print_status "Starting backend server..."
cd backend
npm run start:dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
print_status "Starting frontend server..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

print_success "Both services started!"
echo ""
print_status "Backend PID: $BACKEND_PID"
print_status "Frontend PID: $FRONTEND_PID"
echo ""
print_status "Backend logs: tail -f backend.log"
print_status "Frontend logs: tail -f frontend.log"
echo ""
print_status "Backend API: http://localhost:3001"
print_status "Frontend App: http://localhost:3000"
echo ""
print_status "Press Ctrl+C to stop both services"

# Wait for processes
wait

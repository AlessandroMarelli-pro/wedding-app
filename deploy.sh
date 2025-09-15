#!/bin/bash

# Wedding App Vercel Deployment Script
# Run this script from the root directory of your project

set -e  # Exit on any error

echo "🚀 Starting Wedding App Deployment to Vercel..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: Please run this script from the root directory of your project"
    exit 1
fi

# Navigate to frontend directory
echo "📁 Navigating to frontend directory..."
cd frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in frontend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️  Building application..."
npm run build

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI not found. Please install it with: npm i -g vercel"
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your PostgreSQL database"
echo "2. Configure environment variables in Vercel dashboard"
echo "3. Run database migrations: cd frontend && npx prisma db push"
echo "4. Seed the database: cd frontend && npm run seed"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo "📋 Use DEPLOYMENT_CHECKLIST.md to verify your deployment"

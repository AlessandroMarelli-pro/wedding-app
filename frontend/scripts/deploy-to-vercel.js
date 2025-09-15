#!/usr/bin/env node

/**
 * Deployment script for Vercel
 * This script helps automate the deployment process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel deployment process...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error(
    '❌ Error: package.json not found. Please run this script from the frontend directory.',
  );
  process.exit(1);
}

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'pipe' });
} catch (error) {
  console.error(
    '❌ Error: Vercel CLI not found. Please install it with: npm i -g vercel',
  );
  process.exit(1);
}

// Check if .env.production exists
const envPath = path.join(__dirname, '..', '.env.production');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Warning: .env.production not found.');
  console.log('   Please create it from .env.production.template');
  console.log(
    '   You can also set environment variables via Vercel CLI or dashboard.\n',
  );
}

// Step 1: Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Step 2: Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully\n');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error.message);
  process.exit(1);
}

// Step 3: Build the application
console.log('🏗️  Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application built successfully\n');
} catch (error) {
  console.error('❌ Error building application:', error.message);
  process.exit(1);
}

// Step 4: Deploy to Vercel
console.log('🚀 Deploying to Vercel...');
try {
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('✅ Deployment completed successfully!\n');
} catch (error) {
  console.error('❌ Error deploying to Vercel:', error.message);
  process.exit(1);
}

console.log('🎉 Deployment process completed!');
console.log('\n📋 Next steps:');
console.log('1. Set up your PostgreSQL database');
console.log('2. Configure environment variables in Vercel dashboard');
console.log('3. Run database migrations: npx prisma db push');
console.log('4. Seed the database: npm run seed');
console.log('5. Test your deployment\n');

console.log('📚 For detailed instructions, see DEPLOYMENT_GUIDE.md');

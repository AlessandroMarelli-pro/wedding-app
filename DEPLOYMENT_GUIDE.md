# 🚀 Vercel Deployment Guide - Wedding App

Complete guide to deploy your Next.js wedding app with PostgreSQL database to Vercel.

## 📋 Prerequisites

Before deploying, ensure you have:

- [Vercel account](https://vercel.com) (free tier available)
- [PostgreSQL database](https://vercel.com/storage/postgres) (Vercel Postgres recommended)
- [GitHub repository](https://github.com) (for automatic deployments)
- Node.js 18.17.0+ installed locally

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Recommended)

1. **Create Vercel Postgres Database**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Create Postgres database
   vercel storage create postgres wedding-db
   ```

2. **Get Database Connection String**
   ```bash
   # Get connection details
   vercel storage ls
   vercel storage inspect postgres://[connection-string]
   ```

### Option 2: External PostgreSQL

Popular alternatives:

- [Supabase](https://supabase.com) (free tier)
- [Railway](https://railway.app) (free tier)
- [Neon](https://neon.tech) (free tier)
- [PlanetScale](https://planetscale.com) (free tier)

## 🔧 Environment Configuration

### 1. Create Production Environment Variables

Create a `.env.production` file in your `frontend/` directory:

```env
# Database Configuration
POSTGRES_PRISMA_URL="postgresql://username:password@host:port/database?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-minimum-32-characters"
JWT_EXPIRES_IN="7d"

# Environment
NODE_ENV="production"

# CORS Configuration (update with your Vercel domain)
CORS_ORIGIN="https://your-app-name.vercel.app"

# File Upload Configuration
UPLOAD_DEST="./uploads"
MAX_FILE_SIZE="5242880"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"

# Admin Configuration
DEFAULT_ADMIN_EMAIL="admin@yourdomain.com"
DEFAULT_ADMIN_PASSWORD="your-secure-admin-password"

# Wedding Information
DEFAULT_COUPLE_NAMES="Ariane & Timothe"
DEFAULT_WEDDING_DATE="2024-06-15T15:00:00Z"
DEFAULT_WEDDING_ADDRESS="Château de Malmaison, Avenue du Château, 92500 Rueil-Malmaison, France"
```

### 2. Update Vercel Configuration

Update your `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "src/pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "POSTGRES_PRISMA_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "JWT_EXPIRES_IN": "@jwt_expires_in",
    "NODE_ENV": "@node_env",
    "CORS_ORIGIN": "@cors_origin",
    "UPLOAD_DEST": "@upload_dest",
    "MAX_FILE_SIZE": "@max_file_size",
    "RATE_LIMIT_WINDOW_MS": "@rate_limit_window_ms",
    "RATE_LIMIT_MAX_REQUESTS": "@rate_limit_max_requests",
    "DEFAULT_ADMIN_EMAIL": "@default_admin_email",
    "DEFAULT_ADMIN_PASSWORD": "@default_admin_password",
    "DEFAULT_COUPLE_NAMES": "@default_couple_names",
    "DEFAULT_WEDDING_DATE": "@default_wedding_date",
    "DEFAULT_WEDDING_ADDRESS": "@default_wedding_address"
  }
}
```

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Ensure your code is in a Git repository**

   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Update package.json scripts** (if needed)
   ```json
   {
     "scripts": {
       "build": "prisma generate && prisma db push && next build",
       "postbuild": "prisma generate"
     }
   }
   ```

### Step 2: Deploy to Vercel

#### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**

   ```bash
   cd frontend
   vercel login
   vercel --prod
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add POSTGRES_PRISMA_URL
   vercel env add JWT_SECRET
   vercel env add JWT_EXPIRES_IN
   vercel env add NODE_ENV
   vercel env add CORS_ORIGIN
   vercel env add UPLOAD_DEST
   vercel env add MAX_FILE_SIZE
   vercel env add RATE_LIMIT_WINDOW_MS
   vercel env add RATE_LIMIT_MAX_REQUESTS
   vercel env add DEFAULT_ADMIN_EMAIL
   vercel env add DEFAULT_ADMIN_PASSWORD
   vercel env add DEFAULT_COUPLE_NAMES
   vercel env add DEFAULT_WEDDING_DATE
   vercel env add DEFAULT_WEDDING_ADDRESS
   ```

#### Method 2: Vercel Dashboard

1. **Import Project**

   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as root directory

2. **Configure Build Settings**

   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env.production` file

### Step 3: Database Migration

1. **Run Prisma Migrations**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # Seed the database
   npm run seed
   ```

2. **Alternative: Use Vercel CLI**
   ```bash
   vercel env pull .env.local
   npx prisma db push
   npm run seed
   ```

### Step 4: Configure Custom Domain (Optional)

1. **Add Custom Domain**

   ```bash
   vercel domains add yourdomain.com
   vercel domains add www.yourdomain.com
   ```

2. **Update DNS Records**
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → `76.76.19.61`

## 🔒 Security Considerations

### 1. Environment Variables Security

- **Never commit `.env` files** to Git
- **Use strong JWT secrets** (minimum 32 characters)
- **Change default admin credentials**
- **Use HTTPS** (automatic with Vercel)

### 2. Database Security

- **Use connection pooling** (automatic with Vercel Postgres)
- **Enable SSL connections**
- **Regular backups** (automatic with Vercel Postgres)

### 3. File Upload Security

- **Validate file types** and sizes
- **Scan uploaded files** for malware
- **Use secure file storage** (consider Vercel Blob)

## 📊 Monitoring & Analytics

### 1. Vercel Analytics

Enable in your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
```

### 2. Error Monitoring

Consider adding:

- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Check build logs
vercel logs [deployment-url]

# Common fixes
npm install --legacy-peer-deps
npx prisma generate
```

#### 2. Database Connection Issues

```bash
# Test database connection
npx prisma db pull
npx prisma studio
```

#### 3. Environment Variable Issues

```bash
# Check environment variables
vercel env ls
vercel env pull .env.local
```

#### 4. File Upload Issues

- Check `UPLOAD_DEST` path
- Verify file size limits
- Ensure proper permissions

### Debug Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Test locally with production env
vercel env pull .env.local
npm run dev
```

## 🔄 CI/CD Pipeline

### Automatic Deployments

1. **Connect GitHub Repository**

   - Vercel automatically deploys on `git push`
   - Preview deployments for pull requests

2. **Branch Protection**

   - Deploy `main` branch to production
   - Deploy feature branches to preview

3. **Environment-specific Deployments**

   ```bash
   # Production
   vercel --prod

   # Preview
   vercel
   ```

## 📈 Performance Optimization

### 1. Next.js Optimizations

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["your-domain.com"],
    formats: ["image/webp", "image/avif"],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

module.exports = nextConfig;
```

### 2. Database Optimizations

- **Use connection pooling**
- **Optimize queries** with Prisma
- **Add database indexes**
- **Use read replicas** for heavy traffic

### 3. Caching Strategies

- **Static generation** for wedding info
- **ISR** for dynamic content
- **Edge caching** with Vercel
- **Database query caching**

## 🎯 Post-Deployment Checklist

- [ ] ✅ Database migrations completed
- [ ] ✅ Environment variables configured
- [ ] ✅ Admin account created
- [ ] ✅ SSL certificate active
- [ ] ✅ Custom domain configured
- [ ] ✅ File uploads working
- [ ] ✅ RSVP system functional
- [ ] ✅ Admin dashboard accessible
- [ ] ✅ Mobile responsiveness tested
- [ ] ✅ Performance monitoring enabled
- [ ] ✅ Backup strategy implemented
- [ ] ✅ Error tracking configured

## 📞 Support

### Vercel Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Vercel Discord](https://vercel.com/discord)

### Database Support

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**🎉 Congratulations! Your wedding app is now live on Vercel!**

For any deployment issues, check the Vercel dashboard logs or contact support through the Vercel platform.

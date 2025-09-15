# 🚀 Wedding App Deployment Guide

This guide will help you deploy your wedding app with separate backend and frontend hosting using the most cost-effective solutions.

## 📋 Overview

- **Frontend**: Next.js app deployed on Vercel (Free)
- **Backend**: NestJS API deployed on Railway ($5/month)
- **Database**: PostgreSQL (included with Railway)
- **File Storage**: Railway persistent storage
- **Backup**: Automated daily backups

## 💰 Cost Breakdown

- Frontend (Vercel): **Free**
- Backend (Railway): **$5/month**
- Database: **Included**
- File Storage: **Included**
- Backup Storage: **~$1-2/month** (optional cloud storage)
- **Total**: **~$6-7/month**

## 🛠️ Prerequisites

1. GitHub repository with your code
2. Railway account (sign up at [railway.app](https://railway.app))
3. Vercel account (sign up at [vercel.com](https://vercel.com))
4. Google Maps API key (for map functionality)

## 📦 Phase 1: Database Migration

### Step 1: Update Dependencies

```bash
cd backend
npm install pg @types/pg
```

### Step 2: Database Configuration

The database configuration has been updated to support both SQLite (development) and PostgreSQL (production). The system automatically detects the database type based on the `DATABASE_URL` environment variable.

## 🚂 Phase 2: Backend Deployment (Railway)

### Step 1: Connect Repository

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your wedding app repository
5. Select the `backend` folder as the root directory

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provide the `DATABASE_URL` environment variable

### Step 3: Configure Environment Variables

In Railway dashboard, go to Variables tab and add:

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1d
PORT=3001
API_PREFIX=api
CORS_ORIGIN=https://your-frontend-domain.vercel.app
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DEFAULT_ADMIN_EMAIL=admin@wedding.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_COUPLE_NAMES=Ariane & Timothe
DEFAULT_WEDDING_DATE=2024-06-15T15:00:00Z
DEFAULT_WEDDING_ADDRESS=Château de Malmaison, Avenue du Château, 92500 Rueil-Malmaison, France
```

### Step 4: Deploy

Railway will automatically:

- Install dependencies
- Build the application
- Run database migrations
- Start the server

### Step 5: Get Backend URL

After deployment, Railway will provide a URL like: `https://your-app-name-production.up.railway.app`

## 🌐 Phase 3: Frontend Deployment (Vercel)

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `frontend` folder as the root directory

### Step 2: Configure Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_COUPLE_NAMES=Ariane & Timothe
NEXT_PUBLIC_WEDDING_DATE=2024-06-15
NEXT_PUBLIC_WEDDING_LOCATION=Château de Malmaison, France
```

### Step 3: Deploy

Vercel will automatically:

- Install dependencies
- Build the application
- Deploy to global CDN

### Step 4: Update CORS Settings

Go back to Railway and update the `CORS_ORIGIN` environment variable with your Vercel domain.

## 🔄 Phase 4: Data Migration

### Option 1: Fresh Start (Recommended)

If you're starting fresh, the PostgreSQL database will be empty. You can:

1. Use the admin panel to configure wedding information
2. Upload guest lists via CSV
3. Add accommodations and program events manually

### Option 2: Migrate Existing Data

If you have existing SQLite data to migrate:

1. **Run migrations first**:

   ```bash
   cd backend
   npm run migration:run
   ```

2. **Use the migration script**:

   ```bash
   # Set your PostgreSQL URL
   export DATABASE_URL="postgresql://username:password@host:port/database"

   # Run the migration script
   node scripts/migrate-sqlite-to-postgres.js
   ```

## 💾 Phase 5: Backup Strategy

### Automated Backups

Railway provides automated PostgreSQL backups, but for additional safety:

1. **Set up daily backups**:

   ```bash
   # Add to your Railway project as a cron job
   # Runs daily at 2 AM
   0 2 * * * /app/scripts/backup-database.sh
   ```

2. **Manual backup script**:
   ```bash
   # Run manually when needed
   ./scripts/backup-database.sh
   ```

### Cloud Storage Backup (Optional)

For additional backup security, you can upload backups to cloud storage:

1. **AWS S3**:

   ```bash
   # Install AWS CLI
   npm install -g aws-cli

   # Configure AWS credentials
   aws configure

   # Uncomment the S3 upload section in backup-database.sh
   ```

2. **Google Cloud Storage**:
   ```bash
   # Install gcloud CLI
   # Configure credentials
   # Update backup script accordingly
   ```

## 🔧 Phase 6: Custom Domain (Optional)

### Backend Custom Domain

1. In Railway dashboard, go to Settings → Domains
2. Add your custom domain (e.g., `api.yourwedding.com`)
3. Update DNS records as instructed
4. Update `CORS_ORIGIN` in Railway environment variables

### Frontend Custom Domain

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain (e.g., `yourwedding.com`)
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_API_URL` in Vercel environment variables

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**:

   - Ensure `CORS_ORIGIN` in Railway matches your Vercel domain exactly
   - Check for trailing slashes in URLs

2. **Database Connection Issues**:

   - Verify `DATABASE_URL` is correctly set in Railway
   - Check if migrations have been run

3. **File Upload Issues**:

   - Ensure `UPLOAD_DEST` directory exists
   - Check file size limits

4. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Health Check

Your backend includes a health check endpoint:

- URL: `https://your-backend.railway.app/api/health`
- Should return: `{"status":"ok","timestamp":"...","uptime":...,"environment":"production"}`

## 📊 Monitoring

### Railway Monitoring

- View logs in Railway dashboard
- Monitor resource usage
- Set up alerts for downtime

### Vercel Analytics

- Built-in analytics in Vercel dashboard
- Performance monitoring
- Error tracking

## 🔐 Security Considerations

1. **Environment Variables**:

   - Never commit `.env` files
   - Use strong JWT secrets
   - Rotate secrets regularly

2. **Database Security**:

   - Use strong database passwords
   - Enable SSL connections
   - Regular backups

3. **API Security**:
   - Rate limiting is configured
   - CORS is properly set up
   - Input validation is in place

## 📈 Scaling

### When You Need More Resources

1. **Railway Pro Plan** ($20/month):

   - More CPU and memory
   - Better performance
   - Priority support

2. **Vercel Pro Plan** ($20/month):

   - More bandwidth
   - Advanced analytics
   - Team collaboration

3. **Database Scaling**:
   - Railway PostgreSQL can handle significant load
   - Consider read replicas for high traffic

## 🎉 You're Done!

Your wedding app is now deployed with:

- ✅ Separate frontend and backend hosting
- ✅ Cost-effective solution (~$6-7/month)
- ✅ Automated database backups
- ✅ Production-ready configuration
- ✅ Health monitoring
- ✅ Scalable architecture

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review Railway and Vercel documentation
3. Check application logs in both platforms
4. Verify environment variables are correctly set

Happy wedding! 🎊

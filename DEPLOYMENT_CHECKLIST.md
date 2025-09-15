# ✅ Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment of your wedding app to Vercel.

## 📋 Pre-Deployment Checklist

### Environment Setup

- [ ] **Vercel Account**: Created and logged in
- [ ] **PostgreSQL Database**: Set up (Vercel Postgres recommended)
- [ ] **GitHub Repository**: Code pushed to main branch
- [ ] **Environment Variables**: Prepared (see `.env.production.template`)

### Code Preparation

- [ ] **Dependencies**: All packages installed (`npm install`)
- [ ] **Build Test**: Application builds successfully (`npm run build`)
- [ ] **Type Check**: No TypeScript errors (`npm run type-check`)
- [ ] **Linting**: Code passes linting (`npm run lint`)
- [ ] **Tests**: All tests pass (`npm run test`)

### Database Preparation

- [ ] **Prisma Schema**: Updated for PostgreSQL
- [ ] **Migrations**: Ready to run (`npx prisma migrate deploy`)
- [ ] **Seed Data**: Prepared for initial setup

## 🚀 Deployment Steps

### Step 1: Initial Setup

- [ ] **Install Vercel CLI**: `npm i -g vercel`
- [ ] **Login to Vercel**: `vercel login`
- [ ] **Link Project**: `vercel link` (or use dashboard)

### Step 2: Database Setup

- [ ] **Create Postgres Database**: `vercel storage create postgres wedding-db`
- [ ] **Get Connection String**: Copy from Vercel dashboard
- [ ] **Update POSTGRES_PRISMA_URL**: Set in environment variables

### Step 3: Environment Variables

Set these in Vercel dashboard or via CLI:

**Required Variables:**

- [ ] `POSTGRES_PRISMA_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Secure random string (32+ chars)
- [ ] `JWT_EXPIRES_IN` - Token expiration (e.g., "7d")
- [ ] `NODE_ENV` - Set to "production"
- [ ] `CORS_ORIGIN` - Your Vercel domain

**Optional Variables:**

- [ ] `DEFAULT_ADMIN_EMAIL` - Admin login email
- [ ] `DEFAULT_ADMIN_PASSWORD` - Admin password
- [ ] `DEFAULT_COUPLE_NAMES` - Wedding couple names
- [ ] `DEFAULT_WEDDING_DATE` - Wedding date
- [ ] `DEFAULT_WEDDING_ADDRESS` - Wedding venue

### Step 4: Deploy Application

- [ ] **Deploy**: `vercel --prod` or use dashboard
- [ ] **Check Build Logs**: Ensure successful build
- [ ] **Verify Domain**: Note your Vercel URL

### Step 5: Database Migration

- [ ] **Generate Prisma Client**: `npx prisma generate`
- [ ] **Push Schema**: `npx prisma db push`
- [ ] **Seed Database**: `npm run seed`

## 🔍 Post-Deployment Verification

### Basic Functionality

- [ ] **Homepage Loads**: Visit your Vercel URL
- [ ] **Wedding Info**: Displays correctly
- [ ] **Program Section**: Events show properly
- [ ] **Accommodations**: Hotels display with maps
- [ ] **RSVP Form**: Can submit RSVP (test with sample code)

### Admin Dashboard

- [ ] **Admin Login**: Access `/admin/login`
- [ ] **Dashboard**: Statistics display correctly
- [ ] **Guest Management**: Can view guest list
- [ ] **Content Management**: Can edit wedding info
- [ ] **File Uploads**: Can upload images and CSV files

### Technical Verification

- [ ] **API Endpoints**: All routes respond correctly
- [ ] **Database Queries**: Data persists correctly
- [ ] **File Uploads**: Files save to correct location
- [ ] **Authentication**: JWT tokens work properly
- [ ] **CORS**: Frontend can communicate with API

### Performance & Security

- [ ] **HTTPS**: Site loads over HTTPS
- [ ] **Mobile Responsive**: Works on mobile devices
- [ ] **Loading Speed**: Pages load quickly
- [ ] **Error Handling**: Graceful error messages
- [ ] **Security Headers**: Proper security configuration

## 🎯 Final Steps

### Custom Domain (Optional)

- [ ] **Add Domain**: Configure custom domain in Vercel
- [ ] **DNS Settings**: Update DNS records
- [ ] **SSL Certificate**: Verify HTTPS works

### Monitoring Setup

- [ ] **Analytics**: Enable Vercel Analytics
- [ ] **Error Tracking**: Set up Sentry (optional)
- [ ] **Performance**: Monitor Core Web Vitals

### Documentation

- [ ] **Update README**: Add deployment instructions
- [ ] **Admin Guide**: Document admin features
- [ ] **Backup Strategy**: Document database backups

## 🚨 Troubleshooting

### Common Issues

- [ ] **Build Failures**: Check build logs in Vercel dashboard
- [ ] **Database Connection**: Verify POSTGRES_PRISMA_URL format
- [ ] **Environment Variables**: Ensure all required vars are set
- [ ] **File Uploads**: Check upload directory permissions
- [ ] **CORS Errors**: Verify CORS_ORIGIN matches your domain

### Debug Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Test locally with production env
vercel env pull .env.local
npm run dev
```

## 📞 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL on Vercel](https://vercel.com/docs/storage/vercel-postgres)

---

**🎉 Congratulations! Your wedding app is now live!**

Once all items are checked, your wedding website should be fully functional and ready for your guests to use.

# Cloudflare R2 CDN Integration Setup Guide

This guide explains how to set up Cloudflare R2 CDN integration for image storage in the wedding app using the AWS S3 SDK.

## Overview

The application now supports automatic image storage in Cloudflare R2 CDN with the following features:

- **S3-Compatible API**: Uses AWS S3 SDK for reliable and robust operations
- **Automatic Upload**: Images are automatically uploaded to Cloudflare R2 after local processing
- **Environment-based Organization**: Files are organized by NODE_ENV (development/production)
- **Fallback Support**: Falls back to local storage if Cloudflare is not configured
- **Metadata Storage**: Stores image metadata in Cloudflare R2
- **Automatic Cleanup**: Deletes from both local storage and Cloudflare when images are removed

## Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account with R2 enabled
2. **R2 Bucket**: Create an R2 bucket for storing images
3. **API Token**: Generate an API token with R2 permissions
4. **Custom Domain** (Optional): Set up a custom domain for your R2 bucket

## Step 1: Create Cloudflare R2 Bucket

1. Log in to your Cloudflare dashboard
2. Navigate to **R2 Object Storage**
3. Click **Create bucket**
4. Choose a bucket name (e.g., `wedding-app-images`)
5. Select a location close to your users
6. Click **Create bucket**

## Step 2: Generate R2 Token

1. In Cloudflare dashboard, go to **My Profile** > **API Tokens**
2. Click **Create Token**
3. Use **Custom token** template
4. Configure permissions:
   - **Account**: `Cloudflare R2:Edit`
   - **Zone Resources**: Include all zones (or specific zone if using custom domain)
5. Set **Account Resources** to include your account
6. Click **Continue to summary** then **Create Token**
7. **Copy the token** - you won't be able to see it again

**Note**: For S3 SDK compatibility, you can also use R2 API tokens which work as both access key ID and secret access key.

## Step 3: Set Up Custom Domain (Optional but Recommended)

1. In your R2 bucket settings, go to **Settings** > **Public access**
2. Click **Connect domain**
3. Add your custom domain (e.g., `images.yourdomain.com`)
4. Follow the DNS configuration instructions
5. Wait for DNS propagation (can take up to 24 hours)

## Step 4: Configure Environment Variables

Add the following variables to your `.env` file:

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"
CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
CLOUDFLARE_BUCKET_NAME="your-bucket-name"
CLOUDFLARE_PUBLIC_URL="https://your-domain.com"
CLOUDFLARE_REGION="auto"
```

### Finding Your Account ID

1. In Cloudflare dashboard, go to **My Profile**
2. Your Account ID is displayed in the right sidebar

### Example Configuration

```bash
# Development environment
NODE_ENV="development"
CLOUDFLARE_ACCOUNT_ID="abc123def456ghi789"
CLOUDFLARE_API_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
CLOUDFLARE_BUCKET_NAME="wedding-app-images"
CLOUDFLARE_PUBLIC_URL="https://images.yourdomain.com"
CLOUDFLARE_REGION="auto"

# Production environment
NODE_ENV="production"
CLOUDFLARE_ACCOUNT_ID="abc123def456ghi789"
CLOUDFLARE_API_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
CLOUDFLARE_BUCKET_NAME="wedding-app-images"
CLOUDFLARE_PUBLIC_URL="https://images.yourdomain.com"
CLOUDFLARE_REGION="auto"
```

## Step 5: Database Migration

The database schema has been updated to include Cloudflare fields. Run the migration:

```bash
cd frontend
npx prisma migrate deploy
```

## Step 6: Test the Integration

Run the test script to verify everything is working:

```bash
cd frontend
npx ts-node scripts/test-cloudflare-integration.ts
```

## File Organization Structure

Images are organized in Cloudflare R2 using the following structure:

```
{NODE_ENV}/
├── images/
│   ├── {timestamp}_{random}_{basename}.{ext}
│   └── ...
├── thumbnails/
│   ├── {timestamp}_{random}_{basename}_thumb_{size}.{ext}
│   └── ...
└── optimized/
    ├── {timestamp}_{random}_{basename}_optimized.{ext}
    └── ...
```

### Examples:

- **Development**: `development/images/1703123456789_abc123_photo.jpg`
- **Production**: `production/images/1703123456789_abc123_photo.jpg`

## How It Works

### Upload Process

1. **Image Processing**: Image is processed locally with Sharp (resize, optimize, etc.)
2. **Local Storage**: Processed image is temporarily stored locally
3. **Cloudflare Upload**: Image is uploaded to Cloudflare R2 with metadata
4. **Local Cleanup**: Local file is deleted after successful Cloudflare upload
5. **Database Record**: Database record includes both local filename and Cloudflare URL

### Retrieval Process

1. **Check Database**: Look up image record in database
2. **Cloudflare URL**: If `cloudflareUrl` exists, return the CDN URL
3. **Local Fallback**: If no Cloudflare URL, serve from local storage

### Deletion Process

1. **Cloudflare Delete**: Delete from Cloudflare R2 if `cloudflareKey` exists
2. **Local Delete**: Delete from local storage if file exists
3. **Database Delete**: Remove database record

## Benefits

- **Global CDN**: Images served from Cloudflare's global network
- **Automatic Optimization**: Cloudflare automatically optimizes images
- **Cost Effective**: R2 storage is cheaper than traditional cloud storage
- **Scalable**: No bandwidth limits on R2
- **Reliable**: Cloudflare's 99.9% uptime SLA

## Troubleshooting

### Common Issues

1. **"Cloudflare R2 configuration incomplete"**
   - Check that all environment variables are set correctly
   - Verify the API token has the correct permissions

2. **"AccessDenied" or "403 Forbidden"**
   - Check your API token has R2:Edit permissions
   - Verify the token is scoped to the correct account
   - Ensure the bucket name is correct

3. **"NoSuchBucket" or "404 Not Found"**
   - Check the bucket name is correct
   - Verify the bucket exists in your Cloudflare account
   - Ensure the Account ID is correct

4. **"InvalidAccessKeyId" or "401 Unauthorized"**
   - Check your API token is valid and not expired
   - Verify the Account ID is correct
   - Ensure the token has the right permissions

5. **"SignatureDoesNotMatch"**
   - This usually indicates incorrect credentials
   - Double-check your Account ID and API Token
   - Ensure you're using the R2 API token, not a regular API token

### Debug Mode

Enable debug logging to see detailed Cloudflare operations:

```bash
LOG_LEVEL=debug npm run dev
```

### Fallback Behavior

If Cloudflare is not configured or fails, the system automatically falls back to local storage. Check the logs for:

- `Cloudflare R2 configuration incomplete` - Configuration missing
- `Cloudflare R2 upload failed` - Upload error, using local storage
- `Cloudflare R2 delete failed` - Delete error, continuing with local cleanup

## Security Considerations

1. **API Token Security**: Store API tokens securely and rotate them regularly
2. **Environment Variables**: Never commit `.env` files to version control
3. **Bucket Permissions**: Use least-privilege access for API tokens
4. **Custom Domain**: Use HTTPS for your custom domain

## Monitoring

Monitor your Cloudflare R2 usage:

1. **Cloudflare Dashboard**: Check storage usage and bandwidth
2. **Application Logs**: Monitor upload success/failure rates
3. **Database**: Track images with/without Cloudflare URLs

## Cost Optimization

1. **Image Optimization**: Use Sharp processing to reduce file sizes before upload
2. **Format Selection**: Use WebP format for better compression
3. **Thumbnail Generation**: Generate thumbnails locally to reduce storage costs
4. **Cleanup**: Regularly clean up unused images

## Support

For issues with this integration:

1. Check the application logs for detailed error messages
2. Verify Cloudflare configuration in the dashboard
3. Test API token permissions manually
4. Review the troubleshooting section above

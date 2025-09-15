# Next.js API Proxy Setup

This document explains how the Next.js API proxy works to hide the backend URL from the browser.

## Overview

The proxy system uses Next.js API routes to forward requests from the frontend to the backend without exposing the backend URL to the browser. This provides better security and allows for easier deployment configuration.

## Architecture

```
Browser Request → Next.js API Route → Backend API
     /api/*           [...path].ts        API_URL/api/*
```

## Files Created

### 1. `/src/pages/api/[...path].ts`

- Main proxy handler for all API requests
- Forwards GET, POST, PUT, DELETE requests
- Handles JSON data and binary responses
- Preserves authentication headers

### 2. `/src/pages/api/upload/[...path].ts`

- Specialized handler for file uploads
- Uses formidable to parse multipart/form-data
- Handles file uploads to endpoints like `/admin/guests/upload` and `/admin/images/upload`

### 3. `/src/pages/api/test-proxy.ts`

- Test endpoint to verify proxy configuration
- Accessible at `/api/test-proxy`

## Environment Configuration

### Before (Exposed to Browser)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### After (Server-side Only)

```env
API_URL=http://localhost:3001
```

## API Service Changes

The `ApiService` class now uses relative URLs:

```typescript
// Before
const baseURL =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

// After
const baseURL = '/api';
```

## File Upload Changes

File upload endpoints now use the upload proxy:

```typescript
// Before
await api.post('/admin/guests/upload', formData);

// After
await api.post('/upload/admin/guests/upload', formData);
```

## Setup Instructions

1. **Update Environment Variables**

   ```bash
   # Copy the template
   cp env.template .env.local

   # Edit .env.local and set:
   API_URL=http://localhost:3001
   ```

2. **Install Dependencies**

   ```bash
   npm install formidable @types/formidable
   ```

3. **Test the Proxy**

   ```bash
   # Start the development server
   npm run dev

   # Test the proxy endpoint
   curl http://localhost:3000/api/test-proxy
   ```

## Benefits

1. **Security**: Backend URL is not exposed to the browser
2. **Flexibility**: Easy to change backend URL without frontend changes
3. **Deployment**: Works seamlessly across different environments
4. **CORS**: No CORS issues since requests go through the same domain

## Production Deployment

For production, set the `API_URL` environment variable to your production backend URL:

```env
API_URL=https://your-backend-domain.com
```

The proxy will automatically forward all requests to the correct backend.

## Troubleshooting

### Common Issues

1. **404 Errors**: Make sure the backend is running and `API_URL` is correct
2. **File Upload Issues**: Check that formidable is installed and upload proxy is used
3. **Authentication Issues**: Verify that authorization headers are being forwarded

### Debug Mode

Add logging to the proxy handlers to debug issues:

```typescript
console.log('Proxying request to:', targetUrl);
console.log('Request method:', req.method);
console.log('Request headers:', req.headers);
```

## Testing

Test the proxy with these endpoints:

- `GET /api/test-proxy` - Test basic proxy functionality
- `GET /api/health` - Test backend connectivity
- `POST /api/auth/login` - Test authentication
- `POST /upload/admin/guests/upload` - Test file uploads

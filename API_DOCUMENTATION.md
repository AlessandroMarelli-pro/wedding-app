# Wedding Website API Documentation

## Overview

This document provides comprehensive documentation for the Wedding Website API. The API is built with NestJS and provides endpoints for managing wedding information, guest RSVPs, accommodations, program events, and administrative functions.

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Most admin endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "data": { ... },
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "error": "ErrorType",
  "message": "Error description",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

## Public Endpoints

### Wedding Information

#### Get Wedding Information

```http
GET /api/wedding
```

**Response:**

```json
{
  "id": "uuid",
  "coupleNames": "Ariane & Timothe",
  "presentationMessage": "We're getting married!",
  "weddingAddress": "123 Wedding St, City",
  "weddingDate": "2024-06-15T15:00:00.000Z",
  "locationDirections": "Directions to venue",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Accommodations

#### Get All Accommodations

```http
GET /api/accommodations
```

#### Get Recommended Accommodations

```http
GET /api/accommodations/recommended
```

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Hotel Example",
    "description": "Beautiful hotel near venue",
    "address": "456 Hotel St, City",
    "contactInfo": "phone: +1234567890",
    "latitude": 40.7128,
    "longitude": -74.006,
    "priceRange": "$150-200/night",
    "isRecommended": true,
    "displayOrder": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Program Events

#### Get Wedding Program

```http
GET /api/program
```

**Response:**

```json
[
  {
    "id": "uuid",
    "title": "Ceremony",
    "description": "Wedding ceremony",
    "startTime": "2024-06-15T15:00:00.000Z",
    "endTime": "2024-06-15T16:00:00.000Z",
    "location": "Main Hall",
    "displayOrder": 1,
    "includeInCalendar": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Download Calendar

```http
GET /api/program/calendar
```

**Response:** iCalendar (.ics) file download

### RSVP System

#### Submit RSVP

```http
POST /api/rsvp
Content-Type: application/json

{
  "hashCode": "ABC12345"
}
```

**Response:**

```json
{
  "success": true,
  "guestName": "John Doe",
  "message": "RSVP confirmed successfully",
  "confirmedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Get Guest Information

```http
GET /api/rsvp/{hashCode}
```

**Response:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "partySize": 2,
  "dietaryRestrictions": "Vegetarian",
  "specialRequests": "Wheelchair accessible",
  "confirmed": true
}
```

### Images

#### Serve Image

```http
GET /api/images/{id}
```

**Response:** Image file with appropriate headers:

- `Content-Type`: Image MIME type
- `Cache-Control`: `public, max-age=31536000`
- `ETag`: Image ID for caching

### Authentication

#### Admin Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "accessToken": "jwt-token-here",
  "expiresIn": 3600
}
```

## Admin Endpoints

### Wedding Management

#### Update Wedding Information

```http
PUT /api/admin/wedding
Authorization: Bearer <token>
Content-Type: application/json

{
  "coupleNames": "Ariane & Timothe",
  "presentationMessage": "Updated message",
  "weddingAddress": "New address",
  "weddingDate": "2024-06-15T15:00:00.000Z",
  "locationDirections": "Updated directions"
}
```

### Guest Management

#### Upload CSV Guest List

```http
POST /api/admin/guests/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <csv-file>
```

**CSV Format:**

```csv
firstName,lastName,email,phoneNumber,partySize,dietaryRestrictions,specialRequests
John,Doe,john@example.com,+1234567890,2,Vegetarian,Wheelchair accessible
Jane,Smith,jane@example.com,,1,,
```

**Response:**

```json
{
  "id": "uuid",
  "filename": "processed-filename.csv",
  "originalFilename": "guests.csv",
  "status": "processing",
  "totalRows": 100,
  "processedRows": 0,
  "validRows": 0,
  "invalidRows": 0,
  "errors": [],
  "uploadedBy": "admin@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Get All Guests

```http
GET /api/admin/guests?page=1&limit=20&search=john
Authorization: Bearer <token>
```

#### Get CSV Uploads

```http
GET /api/admin/guests/uploads
Authorization: Bearer <token>
```

#### Get CSV Upload Details

```http
GET /api/admin/guests/uploads/{id}
Authorization: Bearer <token>
```

#### Get CSV Upload Report

```http
GET /api/admin/guests/uploads/{id}/report
Authorization: Bearer <token>
```

#### Export Guest Data

```http
GET /api/admin/guests/export
Authorization: Bearer <token>
```

**Response:** CSV file download

#### Get Guest Export Data (JSON)

```http
GET /api/admin/guests/export/data
Authorization: Bearer <token>
```

#### Delete Guest

```http
DELETE /api/admin/guests/{id}
Authorization: Bearer <token>
```

#### Delete Guests from Upload

```http
DELETE /api/admin/guests/uploads/{id}/guests
Authorization: Bearer <token>
```

### Accommodations Management

#### Create Accommodation

```http
POST /api/admin/accommodations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Hotel",
  "description": "Hotel description",
  "address": "123 Hotel St",
  "contactInfo": "+1234567890",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "priceRange": "$100-150/night",
  "isRecommended": true,
  "displayOrder": 1
}
```

#### Get All Accommodations (Admin)

```http
GET /api/admin/accommodations
Authorization: Bearer <token>
```

#### Update Accommodation

```http
PUT /api/admin/accommodations/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Hotel Name",
  "description": "Updated description"
}
```

#### Delete Accommodation

```http
DELETE /api/admin/accommodations/{id}
Authorization: Bearer <token>
```

#### Seed Default Accommodations

```http
POST /api/admin/seed/accommodations
Authorization: Bearer <token>
```

### Program Management

#### Create Program Event

```http
POST /api/admin/program
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Event",
  "description": "Event description",
  "startTime": "2024-06-15T15:00:00.000Z",
  "endTime": "2024-06-15T16:00:00.000Z",
  "location": "Event Location",
  "displayOrder": 1,
  "includeInCalendar": true
}
```

#### Get All Program Events (Admin)

```http
GET /api/admin/program
Authorization: Bearer <token>
```

#### Update Program Event

```http
PUT /api/admin/program/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Event Title",
  "description": "Updated description"
}
```

#### Delete Program Event

```http
DELETE /api/admin/program/{id}
Authorization: Bearer <token>
```

#### Reorder Program Events

```http
PUT /api/admin/program
Authorization: Bearer <token>
Content-Type: application/json

[
  {
    "id": "event-uuid-1",
    "displayOrder": 1
  },
  {
    "id": "event-uuid-2",
    "displayOrder": 2
  }
]
```

### RSVP Management

#### Get All RSVP Confirmations

```http
GET /api/admin/rsvp/confirmations
Authorization: Bearer <token>
```

#### Get RSVP Statistics

```http
GET /api/admin/rsvp/stats
Authorization: Bearer <token>
```

**Response:**

```json
{
  "totalGuests": 100,
  "confirmedGuests": 75,
  "pendingGuests": 25,
  "confirmationRate": 0.75,
  "totalPartySize": 200,
  "confirmedPartySize": 150,
  "recentConfirmations": [
    {
      "guestName": "John Doe",
      "confirmedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Confirmed Guests

```http
GET /api/admin/rsvp/confirmed
Authorization: Bearer <token>
```

#### Get Pending Guests

```http
GET /api/admin/rsvp/pending
Authorization: Bearer <token>
```

#### Get Recent Confirmations

```http
GET /api/admin/rsvp/recent?limit=10
Authorization: Bearer <token>
```

#### Delete RSVP Confirmation

```http
DELETE /api/admin/rsvp/confirmations/{id}
Authorization: Bearer <token>
```

### Image Management

#### Upload Image

```http
POST /api/admin/images/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <image-file>
altText: "Image description"
category: "wedding"
```

**Supported formats:** JPEG, PNG, WebP

**Response:**

```json
{
  "id": "uuid",
  "filename": "processed-filename.jpg",
  "originalFilename": "image.jpg",
  "mimeType": "image/jpeg",
  "size": 1024000,
  "altText": "Image description",
  "category": "wedding",
  "uploadedBy": "admin@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Get All Images

```http
GET /api/admin/images?page=1&limit=20&category=wedding
Authorization: Bearer <token>
```

#### Get Image Metadata

```http
GET /api/admin/images/{id}
Authorization: Bearer <token>
```

#### Update Image Metadata

```http
PUT /api/admin/images/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "altText": "Updated description",
  "category": "updated-category"
}
```

#### Delete Image

```http
DELETE /api/admin/images/{id}
Authorization: Bearer <token>
```

#### Generate Thumbnail

```http
POST /api/admin/images/{id}/thumbnail
Authorization: Bearer <token>
Content-Type: application/json

{
  "width": 300,
  "height": 300
}
```

#### Optimize Image

```http
POST /api/admin/images/{id}/optimize
Authorization: Bearer <token>
```

#### Clean Up Orphaned Images

```http
POST /api/admin/images/cleanup
Authorization: Bearer <token>
```

### System Management

#### Manual System Cleanup

```http
POST /api/admin/system/cleanup
Authorization: Bearer <token>
```

#### Get Storage Statistics

```http
GET /api/admin/system/storage
Authorization: Bearer <token>
```

**Response:**

```json
{
  "totalSize": 104857600,
  "imageCount": 50,
  "csvCount": 5,
  "tempSize": 1048576,
  "orphanedFiles": 2
}
```

#### Check System Health

```http
GET /api/admin/system/health
Authorization: Bearer <token>
```

**Response:**

```json
{
  "status": "healthy",
  "uploadSystem": "operational",
  "database": "connected",
  "storage": "available",
  "lastCheck": "2024-01-01T00:00:00.000Z"
}
```

### Analytics & Reporting

#### Get RSVP Analytics

```http
GET /api/admin/analytics/rsvp
Authorization: Bearer <token>
```

#### Get Dashboard Statistics

```http
GET /api/admin/analytics/dashboard
Authorization: Bearer <token>
```

#### Get Upload Analytics

```http
GET /api/admin/analytics/uploads
Authorization: Bearer <token>
```

## Error Codes

| Code | Description                                  |
| ---- | -------------------------------------------- |
| 400  | Bad Request - Invalid input data             |
| 401  | Unauthorized - Invalid or missing JWT token  |
| 403  | Forbidden - Insufficient permissions         |
| 404  | Not Found - Resource not found               |
| 409  | Conflict - Resource already exists           |
| 413  | Payload Too Large - File size exceeds limit  |
| 415  | Unsupported Media Type - Invalid file format |
| 422  | Unprocessable Entity - Validation errors     |
| 500  | Internal Server Error - Server error         |

## Rate Limiting

- **Public endpoints**: 100 requests per minute per IP
- **Admin endpoints**: 200 requests per minute per authenticated user
- **File uploads**: 10 uploads per minute per authenticated user

## File Upload Limits

- **CSV files**: 5MB maximum
- **Images**: 10MB maximum
- **Supported image formats**: JPEG, PNG, WebP
- **Automatic optimization**: Images are automatically optimized for web delivery

## Caching

- **Images**: Cached for 1 year with ETag support
- **Wedding info**: Cached for 1 hour
- **Accommodations**: Cached for 30 minutes
- **Program events**: Cached for 30 minutes

## Webhooks (Future Enhancement)

Webhook support for real-time notifications is planned for future releases:

- RSVP confirmations
- CSV upload completions
- System health alerts

## SDKs and Libraries

Official SDKs are available for:

- JavaScript/TypeScript
- Python
- PHP

## Support

For API support and questions:

- **Documentation**: Available at `/api/docs` (Swagger UI)
- **Issues**: Report via GitHub issues
- **Email**: api-support@wedding-website.com

---

_Last updated: January 2024_
_API Version: 1.0.0_

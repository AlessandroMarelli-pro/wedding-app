# Data Model Design

## Entity Definitions

### Admin
**Purpose**: Administrator authentication and session management
```typescript
interface Admin {
  id: string;           // UUID primary key
  email: string;        // Unique login email
  passwordHash: string; // bcrypt hashed password
  createdAt: Date;      // Account creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

**Validation Rules**:
- email: Valid email format, unique constraint
- passwordHash: minimum 8 characters before hashing
- Soft limit: 2 admin accounts maximum

### WeddingInfo
**Purpose**: Core wedding information and presentation content
```typescript
interface WeddingInfo {
  id: string;                    // UUID primary key
  coupleNames: string;           // e.g., "Ariane & Timothe"
  presentationMessage: string;   // Personal message from couple
  weddingAddress: string;        // Venue address
  weddingDate: Date;            // Wedding date and time
  locationDirections: string;    // How to get to location
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:
- coupleNames: Required, max 100 characters
- presentationMessage: Required, max 2000 characters  
- weddingAddress: Required, max 300 characters
- weddingDate: Must be future date
- Single record constraint (only one wedding info)

### Accommodation
**Purpose**: Hotel/lodging recommendations with location data
```typescript
interface Accommodation {
  id: string;              // UUID primary key
  name: string;            // Hotel/B&B name
  description: string;     // Recommendation details
  address: string;         // Full address
  contactInfo: string;     // Phone/website
  latitude?: number;       // GPS coordinates for map
  longitude?: number;      // GPS coordinates for map
  priceRange?: string;     // e.g., "$$" or "€80-120/night"
  isRecommended: boolean;  // Featured recommendation
  displayOrder: number;    // Sort order
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:
- name: Required, max 100 characters
- description: Required, max 500 characters
- address: Required, max 300 characters
- contactInfo: Optional, max 200 characters
- coordinates: Optional, valid lat/lng ranges
- displayOrder: Unique integer for sorting

### Guest
**Purpose**: Wedding guest information from CSV import
```typescript
interface Guest {
  id: string;          // UUID primary key
  firstName: string;   // Required from CSV
  lastName: string;    // Required from CSV  
  email?: string;      // Optional from CSV
  hashCode: string;    // Generated 8-character code
  csvUploadId: string; // Reference to upload batch
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:
- firstName: Required, max 50 characters, trim whitespace
- lastName: Required, max 50 characters, trim whitespace
- email: Optional, valid email format if provided
- hashCode: Unique, 8 characters, alphanumeric
- csvUploadId: Foreign key to CSVUpload

### CSVUpload
**Purpose**: Track CSV import batches and processing status
```typescript
interface CSVUpload {
  id: string;              // UUID primary key
  filename: string;        // Original CSV filename
  totalRows: number;       // Total rows in CSV
  processedRows: number;   // Successfully processed
  errorRows: number;       // Failed validations
  status: UploadStatus;    // Processing state
  errorLog?: string;       // JSON array of errors
  uploadedBy: string;      // Admin ID who uploaded
  createdAt: Date;
  updatedAt: Date;
}

enum UploadStatus {
  PENDING = 'pending',
  PROCESSING = 'processing', 
  COMPLETED = 'completed',
  FAILED = 'failed'
}
```

**Validation Rules**:
- filename: Required, max 200 characters
- totalRows: Non-negative integer
- processedRows: Non-negative, <= totalRows
- errorRows: Non-negative, processedRows + errorRows <= totalRows
- errorLog: Valid JSON array if present

### RSVPConfirmation
**Purpose**: Track guest attendance confirmations
```typescript
interface RSVPConfirmation {
  id: string;         // UUID primary key
  hashCode: string;   // Guest hash code (unique)
  guestId: string;    // Reference to Guest record
  confirmedAt: Date;  // Confirmation timestamp
  ipAddress: string;  // Request IP for tracking
  userAgent?: string; // Browser info for analytics
}
```

**Validation Rules**:
- hashCode: Must exist in Guest table, unique constraint
- guestId: Foreign key to Guest
- ipAddress: Valid IPv4/IPv6 format
- One confirmation per hash code (prevents duplicates)

### ProgramEvent
**Purpose**: Wedding program schedule for calendar export
```typescript
interface ProgramEvent {
  id: string;           // UUID primary key
  title: string;        // Event name
  description: string;  // Event details
  startTime: Date;      // Event start
  endTime: Date;        // Event end
  location: string;     // Event location
  displayOrder: number; // Sort order in program
  includeInCalendar: boolean; // Export to .ics file
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:
- title: Required, max 100 characters
- startTime: Required, must be before endTime
- endTime: Required, must be after startTime
- location: Required, max 200 characters
- displayOrder: Unique integer for sorting

### UploadedImage
**Purpose**: Manage images uploaded through admin interface
```typescript
interface UploadedImage {
  id: string;          // UUID primary key
  originalName: string; // Original filename
  filename: string;    // Stored filename
  mimeType: string;    // Image MIME type
  size: number;        // File size in bytes
  width: number;       // Image width in pixels
  height: number;      // Image height in pixels
  altText?: string;    // Accessibility description
  usageLocation: string; // Where image is used
  uploadedBy: string;  // Admin ID who uploaded
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:
- originalName: Required, max 200 characters
- filename: Required, unique, max 200 characters  
- mimeType: Must be image type (image/jpeg, image/png, image/webp)
- size: Max 5MB (5,242,880 bytes)
- dimensions: Max 3000x3000 pixels
- altText: Optional, max 200 characters

## Relationships

```
Admin (1) → (N) CSVUpload
Admin (1) → (N) UploadedImage
CSVUpload (1) → (N) Guest
Guest (1) → (1) RSVPConfirmation
```

## State Transitions

### CSV Upload Process
```
PENDING → PROCESSING → COMPLETED
        ↘          ↗
         → FAILED ←
```

### RSVP Confirmation Flow
```
Guest Created → Hash Code Generated → RSVP Confirmed
             ↘                   ↗
              → Hash Code Invalid →
```

## Database Indices

### Primary Keys
- All entities use UUID primary keys

### Unique Constraints  
- Admin.email
- Guest.hashCode
- RSVPConfirmation.hashCode
- UploadedImage.filename
- Accommodation.displayOrder
- ProgramEvent.displayOrder

### Search Indices
- Guest: hashCode (for RSVP lookups)
- Guest: csvUploadId (for batch operations)
- RSVPConfirmation: confirmedAt (for reporting)
- Accommodation: isRecommended, displayOrder (for ordering)
- ProgramEvent: displayOrder, includeInCalendar (for calendar export)

## Data Validation Summary

### CSV Import Validation
1. File format: .csv extension, valid UTF-8 encoding
2. Headers: firstname, lastname, email (case-insensitive)
3. Required fields: firstname, lastname (non-empty after trim)
4. Optional field: email (valid format if provided)
5. Duplicate detection: firstname + lastname combination
6. Hash code generation: Unique 8-character alphanumeric

### Hash Code Requirements
- Length: Exactly 8 characters
- Characters: A-Z, 0-9 (uppercase letters and digits)
- Uniqueness: Globally unique across all guests
- Generation: Cryptographically secure random
- Collision handling: Regenerate if duplicate detected
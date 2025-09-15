# Logging Guide

This project uses a custom logger utility designed for Vercel deployment. The logger provides structured logging that works well in both development and production environments.

## Features

- **Structured Logging**: JSON-formatted logs in production for easy parsing
- **Development-friendly**: Human-readable console output in development
- **Multiple Log Levels**: Error, Warn, Info, Debug
- **Context Support**: Add metadata to log entries
- **Specialized Methods**: Pre-built methods for common logging scenarios
- **Vercel Optimized**: Designed to work well with Vercel's function logs

## Basic Usage

```typescript
import { logger } from '../../../lib/logger';

// Basic logging
logger.info('User logged in', { userId: '123' });
logger.warn('Rate limit approaching', { requests: 95 });
logger.error('Database connection failed', { host: 'db.example.com' }, error);
logger.debug('Processing request', { requestId: 'abc123' });
```

## Specialized Logging Methods

### API Requests

```typescript
logger.logRequest('POST', '/api/users', { userId: '123' });
logger.logResponse('POST', '/api/users', 201, 150, { userId: '123' });
```

### Database Operations

```typescript
logger.logDatabase('INSERT', 'users', { email: 'user@example.com' });
```

### Authentication Events

```typescript
logger.logAuth('login', 'user123', { email: 'user@example.com' });
logger.logAuth('logout', 'user123');
logger.logAuth('login_failed', undefined, { email: 'user@example.com' });
```

### File Operations

```typescript
logger.logFileOperation('upload', 'image.jpg', 1024000, { userId: '123' });
logger.logFileOperation('delete', 'temp-file.tmp');
```

### Cron Jobs

```typescript
logger.logCron('daily-cleanup', 'started');
logger.logCron('daily-cleanup', 'completed', { filesDeleted: 10 });
logger.logCron('daily-cleanup', 'failed', { error: 'Permission denied' });
```

## Context and Scoped Logging

### Adding Context to Individual Logs

```typescript
logger.error('Payment failed', {
  userId: '123',
  amount: 99.99,
  paymentMethod: 'card',
});
```

### Creating a Scoped Logger

```typescript
const userLogger = logger.withContext({ userId: '123', sessionId: 'abc' });

userLogger.info('User action performed'); // Automatically includes userId and sessionId
userLogger.warn('Additional warning', { action: 'retry' }); // Merges with existing context
```

## Error Logging

Always include the Error object when logging errors:

```typescript
try {
  // Some operation
} catch (error) {
  logger.error(
    'Operation failed',
    { operation: 'userCreation' },
    error as Error,
  );
}
```

## Environment Behavior

### Development Mode (`NODE_ENV=development`)

- Human-readable console output
- Includes stack traces for errors
- Easy to read during development

### Production Mode (`NODE_ENV=production`)

- Structured JSON logs
- Optimized for log aggregation tools
- No stack traces (for security)
- Perfect for Vercel function logs

## Vercel Integration

In Vercel, logs will appear in:

1. **Function Logs**: Available in the Vercel dashboard
2. **Real-time Logs**: During development with `vercel dev`
3. **Deployment Logs**: In the deployment details

### Viewing Logs in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to the "Functions" tab
4. Click on any function to see its logs
5. Use the search/filter to find specific log entries

## Best Practices

1. **Use Appropriate Log Levels**:
   - `error`: For errors that need immediate attention
   - `warn`: For potential issues or deprecated usage
   - `info`: For important business events
   - `debug`: For detailed debugging information

2. **Include Relevant Context**:

   ```typescript
   // Good
   logger.error('Payment failed', { userId, amount, paymentMethod }, error);

   // Avoid
   logger.error('Payment failed');
   ```

3. **Use Specialized Methods When Available**:

   ```typescript
   // Good
   logger.logAuth('login', userId, { email });

   // Less ideal
   logger.info('User login', { userId, email, event: 'login' });
   ```

4. **Don't Log Sensitive Information**:

   ```typescript
   // Good
   logger.logAuth('login', userId, { email: 'user@example.com' });

   // Avoid
   logger.logAuth('login', userId, { password: 'secret123' });
   ```

## Migration from console.log

The logger replaces all `console.log`, `console.error`, and `console.warn` statements throughout the API routes. This provides:

- Consistent log formatting
- Better error tracking
- Structured data for monitoring tools
- Vercel-optimized output

## Testing the Logger

You can test the logger by calling the test endpoint:

```bash
curl http://localhost:3000/api/test-logger
```

This will generate various log entries that you can observe in your development console or Vercel logs.

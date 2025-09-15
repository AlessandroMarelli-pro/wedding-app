import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { initializeUploadSystem } from './config/upload';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  // Initialize upload system before creating the app
  initializeUploadSystem();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global API prefix
  app.setGlobalPrefix('api');

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000', // Next.js development server
      'http://localhost:3001', // Alternative port
      'https://wedding.example.com', // Production domain
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  });
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not in DTO
      forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
      transform: true, // Transform payloads to DTO instances
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Security headers
  app.use((req: any, res: any, next: any) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' http://localhost:* https:",
        "frame-ancestors 'none'",
      ].join('; '),
    );

    next();
  });

  // Rate limiting (basic implementation)
  const rateLimitMap = new Map();
  app.use((req: any, res: any, next: any) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 60 * 1000; // 15 minutes
    const maxRequests = 100; // Max requests per window

    if (!rateLimitMap.has(clientIP)) {
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const clientData = rateLimitMap.get(clientIP);

    if (now > clientData.resetTime) {
      // Reset the window
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
      });
    }

    clientData.count++;
    next();
  });

  // Swagger API documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Wedding Website API')
      .setDescription('REST API for wedding website management and RSVP system')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'Admin login endpoints')
      .addTag('Public', 'Public endpoints (no authentication required)')
      .addTag('Admin', 'Admin-only endpoints (requires authentication)')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    console.log(
      '📚 Swagger documentation available at: http://localhost:3001/api/docs',
    );
  }

  const port = process.env.PORT || 3001;
  const host = process.env.HOST || 'localhost';
  await app.listen(port, host);

  console.log('🚀 Wedding API Server started successfully!');
  console.log(`📍 Server running on: http://${host}:${port}`);
  console.log(`🔗 API endpoints: http://localhost:${port}/api`);
  console.log('💒 Ready to manage your wedding website!');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

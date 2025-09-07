import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
  };
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Skip authentication for public routes
    const publicRoutes = [
      '/api/wedding',
      '/api/accommodations',
      '/api/rsvp',
      '/api/program',
      '/api/auth/login',
    ];

    const isPublicRoute = publicRoutes.some((route) =>
      req.path.startsWith(route),
    );

    if (isPublicRoute && req.method === 'GET') {
      return next();
    }

    if (req.path === '/api/rsvp' && req.method === 'POST') {
      return next();
    }

    if (req.path === '/api/auth/login' && req.method === 'POST') {
      return next();
    }

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify and decode the JWT token
      const payload = this.jwtService.verify(token);

      // Attach user information to the request object
      req.user = {
        sub: payload.sub,
        email: payload.email,
        iat: payload.iat,
        exp: payload.exp,
      };

      next();
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      } else if (error?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      } else {
        throw new UnauthorizedException('Token verification failed');
      }
    }
  }
}

// Extend Express Request type globally
declare module 'express' {
  interface Request {
    user?: {
      sub: string;
      email: string;
      iat?: number;
      exp?: number;
    };
  }
}

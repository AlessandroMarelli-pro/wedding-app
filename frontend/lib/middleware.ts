import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from './auth';

export interface AuthenticatedRequest extends NextApiRequest {
  admin: {
    id: string;
    email: string;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    (req as AuthenticatedRequest).admin = {
      id: payload.adminId,
      email: payload.email,
    };
    return handler(req as AuthenticatedRequest, res);
  };
}

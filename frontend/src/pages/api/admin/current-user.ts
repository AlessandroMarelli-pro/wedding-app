import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../lib/middleware';

import { logger } from '@/logger';
async function getCurrentUser(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // The admin information is already available from the middleware
    res.json({
      id: req.admin.id,
      email: req.admin.email,
    });
  } catch (error) {
    logger.error('Get current user error:', error as Error);
    res.status(500).json({ error });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(getCurrentUser)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/prisma';

import { logger } from '@/logger';
async function deleteGuest(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    await prisma.guest.delete({
      where: { id: id as string },
    });

    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    logger.error('Delete guest error:', error as Error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'DELETE':
      return withAuth(deleteGuest)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

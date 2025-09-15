import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

import { logger } from '@/logger';
async function getAllEvents(req: NextApiRequest, res: NextApiResponse) {
  try {
    const events = await prisma.programEvent.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    res.json(events);
  } catch (error) {
    logger.error('Get program events error:', error as Error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getAllEvents(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

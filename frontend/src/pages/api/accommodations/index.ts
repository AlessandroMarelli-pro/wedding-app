import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

import { logger } from '@/logger';
async function getAllAccommodations(req: NextApiRequest, res: NextApiResponse) {
  try {
    const accommodations = await prisma.accommodation.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    res.json(accommodations);
  } catch (error) {
    logger.error('Get accommodations error:', error as Error);
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getAllAccommodations(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

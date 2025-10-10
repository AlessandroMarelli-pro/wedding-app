import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

import { logger } from '@/logger';
async function getAllAccommodations(req: NextApiRequest, res: NextApiResponse) {
  try {
    const accommodations = await prisma.accommodation.findMany({
      orderBy: { displayOrder: 'asc' },
      cacheStrategy: {
        ttl: 24 * 60 * 30, // One month
        tags: ['findMany_accommodations'],
      },
    });
    // Generate a random ID for each accommodation (if needed for frontend use)
    // This does not modify the DB, just adds a randomId property to each item in the response

    res.json(
      accommodations.map((acc) => ({
        ...acc,
        randomId: Math.random().toString(36).substr(2, 9),
      })),
    );
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

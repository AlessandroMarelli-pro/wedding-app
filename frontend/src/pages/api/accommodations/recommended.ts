import { logger } from '@/logger';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

async function getRecommendedAccommodations(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const accommodations = await prisma.accommodation.findMany({
      where: { isRecommended: true },
      orderBy: { displayOrder: 'asc' },
    });

    res.json(accommodations);
  } catch (error) {
    logger.error('Get recommended accommodations error:', error as Error);
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getRecommendedAccommodations(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

import { logger } from '@/logger';
async function getImages(req: NextApiRequest, res: NextApiResponse) {
  try {
    const images = await prisma.uploadedImage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(images);
  } catch (error) {
    logger.error('Get images error:', error as Error);
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getImages(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

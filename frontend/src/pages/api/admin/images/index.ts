import { NextApiRequest, NextApiResponse } from 'next';
import { ImageProcessor } from '../../../../../lib/image-processor';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';

import { logger } from '@/logger';
async function getAllImages(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const imageProcessor = new ImageProcessor();
    const images = await imageProcessor.getAllImages();

    res.json(images);
  } catch (error: any) {
    logger.error('Get images error:', error as Error);
    res.status(500).json({ error: 'Failed to get images' });
  }
}

async function getImageStats(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const imageProcessor = new ImageProcessor();
    const stats = await imageProcessor.getImageStats();

    res.json(stats);
  } catch (error: any) {
    logger.error('Get image stats error:', error as Error);
    res.status(500).json({ error: 'Failed to get image stats' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(getAllImages)(req, res);
    case 'POST':
      return withAuth(getImageStats)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

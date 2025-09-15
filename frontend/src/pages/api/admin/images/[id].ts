import { NextApiRequest, NextApiResponse } from 'next';
import { ImageProcessor } from '../../../../../lib/image-processor';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';

import { logger } from '@/logger';
async function getImageById(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Image ID is required' });
    }

    const imageProcessor = new ImageProcessor();
    const image = await imageProcessor.getImageById(id);

    res.json(image);
  } catch (error: any) {
    logger.error('Get image error:', error as Error);
    if (error.message === 'Image not found') {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.status(500).json({ error: 'Failed to get image' });
  }
}

async function deleteImage(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Image ID is required' });
    }

    const imageProcessor = new ImageProcessor();
    await imageProcessor.deleteImage(id);

    res.json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    logger.error('Delete image error:', error as Error);
    if (error.message === 'Image not found') {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.status(500).json({ error: 'Failed to delete image' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(getImageById)(req, res);
    case 'DELETE':
      return withAuth(deleteImage)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { ImageProcessor } from '../../../../lib/image-processor';

import { logger } from '@/logger';
async function serveImage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Image ID is required' });
    }

    const imageProcessor = new ImageProcessor();
    const imageFile = await imageProcessor.getImageFile(id);

    // Set appropriate headers
    res.setHeader('Content-Type', imageFile.mimeType);
    res.setHeader('Content-Length', imageFile.buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache

    // Send the image buffer
    res.send(imageFile.buffer);
  } catch (error: any) {
    logger.error('Serve image error:', error as Error);
    if (
      error.message === 'Image not found' ||
      error.message === 'Image file not found on disk'
    ) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.status(500).json({ error: 'Failed to serve image' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return serveImage(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

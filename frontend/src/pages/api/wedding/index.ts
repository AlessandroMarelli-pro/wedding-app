import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_cache } from 'next/cache';
import { prisma } from '../../../../lib/prisma';
import { CacheManager } from '../../../lib/cache-manager';

import { logger } from '@/logger';

// Server-side cached function with versioning
const getCachedWeddingInfo = unstable_cache(
  async (version: number) => {
    return await prisma.weddingInfo.findFirst({});
  },
  ['wedding-info'],
  {
    tags: ['wedding-info'],
    revalidate: 31536000, // Cache for 1 hour
  },
);

async function getWeddingInfo(req: NextApiRequest, res: NextApiResponse) {
  try {
    const startTime = Date.now();
    const currentVersion = CacheManager.getVersion('weddingInfo');
    const weddingInfo = await getCachedWeddingInfo(currentVersion);
    const duration = Date.now() - startTime;

    logger.info(
      `Wedding info fetched in ${duration}ms (server-side cache, version: ${currentVersion})`,
    );

    if (!weddingInfo) {
      return res.status(404).json({ error: 'Wedding information not found' });
    }

    // Set HTTP cache headers for client-side caching
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=31536000, stale-while-revalidate',
    );
    res.setHeader('CDN-Cache-Control', 'public, s-maxage=31536000');
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('X-Cache-Version', currentVersion.toString());

    res.json(weddingInfo);
  } catch (error) {
    logger.error('Get wedding info error:', error as Error);
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getWeddingInfo(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

import { logger } from '@/logger';
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../lib/middleware';
import { prisma } from '../../../lib/prisma';

async function forceUpdateHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Update a special "cache_buster" record in the database
    // This will force the getStaticProps to see new data
    const cacheBuster = await prisma.weddingInfo.upsert({
      where: { id: 'cache-buster' },
      update: {
        updatedAt: new Date(),
      },
      create: {
        id: 'cache-buster',
        coupleNames: 'Cache Buster',
        weddingDate: new Date(),
        updatedAt: new Date(),
      },
    });

    logger.info('Cache buster updated', {
      id: cacheBuster.id,
      updatedAt: cacheBuster.updatedAt,
    });

    return res.json({
      success: true,
      message: 'Cache buster updated successfully',
      timestamp: new Date().toISOString(),
      cacheBusterId: cacheBuster.id,
    });
  } catch (error) {
    logger.error('Force update error:', error as Error);
    return res.status(500).json({
      error: 'Failed to force update',
      message: (error as Error).message,
    });
  }
}

export default withAuth(forceUpdateHandler);

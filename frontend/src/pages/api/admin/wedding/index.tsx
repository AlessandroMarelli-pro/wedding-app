import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/prisma';

import { logger } from '@/logger';
import { toUTCDate } from 'lib/date';

async function getWeddingInfo(req: NextApiRequest, res: NextApiResponse) {
  try {
    const weddingInfo = await prisma.weddingInfo.findFirst();

    if (!weddingInfo) {
      return res.status(404).json({ error: 'Wedding information not found' });
    }

    res.json(weddingInfo);
  } catch (error) {
    logger.error('Get wedding info error:', error as Error);
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

async function updateWeddingInfo(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    const {
      coupleNames,
      presentationMessage,
      weddingAddress,
      weddingDate,
      locationDirections,
      heroImageId,
      heroMessage,
      heroAddress,
    } = req.body;

    const date = Date.UTC(
      new Date(weddingDate).getFullYear(),
      new Date(weddingDate).getMonth(),
      new Date(weddingDate).getDate(),
      12,
      0,
      0,
    );
    const weddingInfo = await prisma.weddingInfo.upsert({
      where: { id: 'default-wedding-info' },
      update: {
        coupleNames,
        presentationMessage,
        weddingAddress,
        weddingDate: weddingDate ? new Date(date) : undefined,
        locationDirections,
        heroImageId,
        heroMessage,
        heroAddress,
      },
      create: {
        id: 'default-wedding-info',
        coupleNames,
        presentationMessage,
        weddingAddress,
        weddingDate: weddingDate
          ? toUTCDate(new Date(weddingDate))
          : new Date(),
        locationDirections,
        heroImageId,
        heroMessage,
        heroAddress,
      },
    });

    // Trigger cache invalidation after successful update
    try {
      // Call our force update endpoint to invalidate the cache
      const forceUpdateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/force-update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers.authorization || '',
          },
        },
      );

      if (forceUpdateResponse.ok) {
        logger.info('Cache invalidated successfully after wedding info update');
      } else {
        logger.warn('Failed to invalidate cache, but update was successful');
      }
    } catch (cacheError) {
      logger.error('Failed to invalidate cache:', cacheError as Error);
      // Don't fail the request if cache invalidation fails
    }

    res.json(weddingInfo);
  } catch (error) {
    logger.error('Update wedding info error:', error as Error);
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
    case 'PUT':
      return withAuth(updateWeddingInfo)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

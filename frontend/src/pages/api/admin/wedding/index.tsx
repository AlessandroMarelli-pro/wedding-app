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

    // With client-side data fetching, we can trigger a refresh notification
    // The page will automatically fetch fresh data within 10 seconds
    logger.info(
      'Wedding info updated successfully - client will fetch fresh data automatically',
    );

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

import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/prisma';

import { logger } from '@/logger';

async function createAccommodation(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    const {
      name,
      description,
      address,
      contactInfo,
      latitude,
      longitude,
      priceRange,
      isRecommended,
      sourceUrl,
      imagesUrl,
    } = req.body;

    // Get the next display order if not provided
    const totalAccommodations = await prisma.accommodation.findFirst({
      orderBy: { displayOrder: 'desc' },
    });
    const finalDisplayOrder = (totalAccommodations?.displayOrder || 0) + 1;

    const accommodation = await prisma.accommodation.create({
      data: {
        name,
        description,
        address,
        contactInfo,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        priceRange,
        isRecommended: Boolean(isRecommended),
        displayOrder: finalDisplayOrder,
        sourceUrl,
        imagesUrl,
      },
    });
    res.status(201).json(accommodation);
  } catch (error) {
    logger.error('Create accommodation error:', error as Error);
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

async function getAllAccommodations(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    const accommodations = await prisma.accommodation.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    res.json(accommodations);
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
      return withAuth(getAllAccommodations)(req, res);
    case 'POST':
      return withAuth(createAccommodation)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

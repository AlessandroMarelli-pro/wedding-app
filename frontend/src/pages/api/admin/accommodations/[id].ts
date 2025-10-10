import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/prisma';

import { logger } from '@/logger';
import { invalidateCache } from 'lib/admin-utils';
async function updateAccommodation(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    const { id } = req.query;
    const {
      name,
      description,
      address,
      contactInfo,
      latitude,
      longitude,
      priceRange,
      isRecommended,
      displayOrder,
      sourceUrl,
      imagesUrl,
    } = req.body;

    const accommodation = await prisma.accommodation.update({
      where: { id: id as string },
      data: {
        name,
        description,
        address,
        contactInfo,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        priceRange,
        isRecommended: Boolean(isRecommended),
        displayOrder,
        sourceUrl,
        imagesUrl,
      },
    });
    await invalidateCache(['findMany_accommodations']);
    res.json(accommodation);
  } catch (error: any) {
    logger.error('Update accommodation error:', error as Error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Accommodation not found' });
    }
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

async function deleteAccommodation(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    const { id } = req.query;

    await prisma.accommodation.delete({
      where: { id: id as string },
    });

    res.json({ message: 'Accommodation deleted successfully' });
  } catch (error: any) {
    logger.error('Delete accommodation error:', error as Error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Accommodation not found' });
    }
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'PUT':
      return withAuth(updateAccommodation)(req, res);
    case 'DELETE':
      return withAuth(deleteAccommodation)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

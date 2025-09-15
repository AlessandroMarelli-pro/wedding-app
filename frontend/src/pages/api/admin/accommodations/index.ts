import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/prisma';

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
      displayOrder,
      sourceUrl,
      imagesUrl,
    } = req.body;

    // Get the next display order if not provided
    let finalDisplayOrder = displayOrder;
    if (!finalDisplayOrder) {
      const lastAccommodation = await prisma.accommodation.findFirst({
        orderBy: { displayOrder: 'desc' },
      });
      finalDisplayOrder = (lastAccommodation?.displayOrder || 0) + 1;
    }

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
    console.error('Create accommodation error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error('Get accommodations error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

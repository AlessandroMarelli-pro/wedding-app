import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/prisma';

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

    res.json(accommodation);
  } catch (error: any) {
    console.error('Update accommodation error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Accommodation not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
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
    console.error('Delete accommodation error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Accommodation not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
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

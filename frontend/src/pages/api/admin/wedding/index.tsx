import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/prisma';

async function getWeddingInfo(req: NextApiRequest, res: NextApiResponse) {
  try {
    const weddingInfo = await prisma.weddingInfo.findFirst();

    if (!weddingInfo) {
      return res.status(404).json({ error: 'Wedding information not found' });
    }

    res.json(weddingInfo);
  } catch (error) {
    console.error('Get wedding info error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

    const weddingInfo = await prisma.weddingInfo.upsert({
      where: { id: 'default-wedding-info' },
      update: {
        coupleNames,
        presentationMessage,
        weddingAddress,
        weddingDate: weddingDate ? new Date(weddingDate) : undefined,
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
        weddingDate: weddingDate ? new Date(weddingDate) : new Date(),
        locationDirections,
        heroImageId,
        heroMessage,
        heroAddress,
      },
    });

    res.json(weddingInfo);
  } catch (error) {
    console.error('Update wedding info error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

import { withAuth } from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';

async function getImages(req: NextApiRequest, res: NextApiResponse) {
  try {
    const images = await prisma.uploadedImage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(images);
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(getImages)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

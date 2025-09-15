import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

async function getAllAccommodations(req: NextApiRequest, res: NextApiResponse) {
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
      return getAllAccommodations(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

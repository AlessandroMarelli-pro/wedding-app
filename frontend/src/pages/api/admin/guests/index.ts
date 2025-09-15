import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/prisma';

async function getAllGuests(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const guests = await prisma.guest.findMany({
      include: {
        csvUpload: true,
        rsvpConfirmation: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    res.json(guests);
  } catch (error) {
    console.error('Get all guests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(getAllGuests)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

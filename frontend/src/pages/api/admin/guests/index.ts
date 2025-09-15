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

async function deleteGuest(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    await prisma.guest.delete({
      where: { id: id as string },
    });

    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Delete guest error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(getAllGuests)(req, res);
    case 'DELETE':
      return withAuth(deleteGuest)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/prisma';

async function getAllConfirmations(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    const confirmations = await prisma.rSVPConfirmation.findMany({
      include: {
        guest: true,
      },
      orderBy: { confirmedAt: 'desc' },
    });

    res.json(confirmations);
  } catch (error) {
    console.error('Get RSVP confirmations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(getAllConfirmations)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

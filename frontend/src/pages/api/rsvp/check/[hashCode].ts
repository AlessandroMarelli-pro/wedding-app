import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';

async function checkConfirmation(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { hashCode } = req.query;

    const guest = await prisma.guest.findUnique({
      where: { hashCode: hashCode as string },
      include: { rsvpConfirmation: true },
    });

    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    res.json({ confirmed: !!guest.rsvpConfirmation });
  } catch (error) {
    console.error('Check confirmation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return checkConfirmation(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

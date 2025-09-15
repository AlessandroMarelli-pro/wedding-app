import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';

import { logger } from '@/logger';
async function getGuestInfo(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { hashCode } = req.query;

    const guest = await prisma.guest.findUnique({
      where: { hashCode: hashCode as string },
      include: { rsvpConfirmation: true },
    });

    if (!guest) {
      return res.status(404).json({ error: 'Code invalide' });
    }

    const confirmed = !!guest.rsvpConfirmation;

    res.json({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phoneNumber: guest.phoneNumber,
      partySize: guest.partySize,
      dietaryRestrictions: guest.dietaryRestrictions,
      specialRequests: guest.specialRequests,
      confirmed,
    });
  } catch (error) {
    logger.error('Get guest info error:', error as Error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getGuestInfo(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

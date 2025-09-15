import { logger } from '@/logger';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

async function confirmRSVP(req: NextApiRequest, res: NextApiResponse) {
  const {
    hashCode,
    isAttending,
    confirmedPartySize,
    dietaryRestrictions,
    specialRequests,
    message,
  } = req.body;
  try {
    if (!hashCode) {
      return res.status(400).json({ error: 'Hash code is required' });
    }

    // Find guest by hash code
    const guest = await prisma.guest.findUnique({
      where: { hashCode },
      include: { rsvpConfirmation: true },
    });

    if (!guest) {
      return res.status(400).json({ error: 'Invalid hash code' });
    }

    // Check if already confirmed
    if (guest.rsvpConfirmation) {
      return res.status(400).json({ error: 'RSVP already confirmed' });
    }

    // Get client IP and user agent
    const ipAddress =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'];

    // Create RSVP confirmation
    const rsvpConfirmation = await prisma.rSVPConfirmation.create({
      data: {
        guestId: guest.id,
        confirmedAt: new Date(),
        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        userAgent,
        isAttending: Boolean(isAttending),
        confirmedPartySize: confirmedPartySize || guest.partySize,
        message,
      },
    });

    logger.info('RSVP confirmed', {
      guestId: guest.id,
      hashCode,
      isAttending,
      confirmedPartySize,
    });

    res.json({
      success: true,
      message: 'RSVP confirmed successfully',
      confirmation: rsvpConfirmation,
    });
  } catch (error) {
    logger.error('Confirm RSVP error', { hashCode }, error as Error);
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

async function checkConfirmation(req: NextApiRequest, res: NextApiResponse) {
  const { hashCode } = req.query;
  try {
    if (!hashCode) {
      return res.status(400).json({ error: 'Hash code is required' });
    }

    const guest = await prisma.guest.findUnique({
      where: { hashCode: hashCode as string },
      include: { rsvpConfirmation: true },
    });

    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    res.json({ confirmed: !!guest.rsvpConfirmation });
  } catch (error) {
    logger.error('Check confirmation error', { hashCode }, error as Error);
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return confirmRSVP(req, res);
    case 'GET':
      return checkConfirmation(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

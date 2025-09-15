import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

async function confirmRSVP(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      hashCode,
      isAttending,
      confirmedPartySize,
      dietaryRestrictions,
      specialRequests,
      message,
    } = req.body;

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

    res.json({
      success: true,
      message: 'RSVP confirmed successfully',
      confirmation: rsvpConfirmation,
    });
  } catch (error) {
    console.error('Confirm RSVP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function checkConfirmation(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { hashCode } = req.query;

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
    console.error('Check confirmation error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/prisma';

import { logger } from '@/logger';
import { toUTCDate } from 'lib/date';
async function createEvent(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      displayOrder,
      includeInCalendar,
      icon,
    } = req.body;

    // Get the next display order if not provided
    let finalDisplayOrder = displayOrder;
    if (!finalDisplayOrder) {
      const lastEvent = await prisma.programEvent.findFirst({
        orderBy: { displayOrder: 'desc' },
      });
      finalDisplayOrder = (lastEvent?.displayOrder || 0) + 1;
    }

    const event = await prisma.programEvent.create({
      data: {
        title,
        description,
        startTime: toUTCDate(new Date(startTime)),
        endTime: toUTCDate(new Date(endTime)),
        location,
        displayOrder: finalDisplayOrder,
        includeInCalendar: Boolean(includeInCalendar),
        icon,
      },
    });
    console.info(event);
    res.status(201).json(event);
  } catch (error) {
    logger.error('Create program event error:', error as Error);
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

async function getAllEvents(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const events = await prisma.programEvent.findMany({
      orderBy: { startTime: 'asc' },
    });

    res.json(events);
  } catch (error) {
    logger.error('Get program events error:', error as Error);
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(getAllEvents)(req, res);
    case 'POST':
      return withAuth(createEvent)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

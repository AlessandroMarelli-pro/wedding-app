import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/prisma';

import { logger } from '@/logger';
import { toUTCDate } from 'lib/date';

async function getEventById(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    const event = await prisma.programEvent.findUnique({
      where: { id: id as string },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    logger.error('Get program event error:', error as Error);
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

async function updateEvent(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
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

    const event = await prisma.programEvent.update({
      where: { id: id as string },
      data: {
        title,
        description,
        startTime: startTime ? toUTCDate(new Date(startTime), true) : undefined,
        endTime: endTime ? toUTCDate(new Date(endTime), true) : undefined,
        location,
        displayOrder,
        includeInCalendar: Boolean(includeInCalendar),
        icon,
      },
    });

    res.json(event);
  } catch (error) {
    logger.error('Update program event error:', error as Error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

async function deleteEvent(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    await prisma.programEvent.delete({
      where: { id: id as string },
    });

    res.json({ message: 'Program event deleted successfully' });
  } catch (error) {
    logger.error('Delete program event error:', error as Error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(getEventById)(req, res);
    case 'PUT':
      return withAuth(updateEvent)(req, res);
    case 'DELETE':
      return withAuth(deleteEvent)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

import { logger } from '@/logger';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

async function healthCheck(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0',
    };

    logger.info('Health check passed', { status: 'healthy' });
    res.json(health);
  } catch (error) {
    logger.error(
      'Health check failed',
      { status: 'unhealthy' },
      error as Error,
    );

    const health = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: (error as Error).message,
    };

    res.status(503).json(health);
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return healthCheck(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

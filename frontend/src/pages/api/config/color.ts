import { logger } from '@/logger';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

async function getColorConfig(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all three colors from the database
    const [primaryColorConfig, secondaryColorConfig, accentColorConfig] =
      await Promise.all([
        prisma.appConfig.findUnique({
          where: { key: 'primary_color' },
        }),
        prisma.appConfig.findUnique({
          where: { key: 'secondary_color' },
        }),
        prisma.appConfig.findUnique({
          where: { key: 'accent_color' },
        }),
      ]);

    // If no colors are configured, return the default colors
    const primaryColor = primaryColorConfig?.value || '#95E1D3';
    const secondaryColor = secondaryColorConfig?.value || '#EAFFD0';
    const accentColor = accentColorConfig?.value || '#F38181';

    const response = {
      primaryColor,
      secondaryColor,
      accentColor,
      timestamp: new Date().toISOString(),
    };

    logger.info('Color config retrieved', {
      primaryColor,
      secondaryColor,
      accentColor,
    });
    res.json(response);
  } catch (error) {
    logger.error(
      'Failed to retrieve color config',
      { error: (error as Error).message },
      error as Error,
    );

    // Return default colors even if database fails
    const response = {
      primaryColor: '#95E1D3',
      secondaryColor: '#EAFFD0',
      accentColor: '#F38181',
      timestamp: new Date().toISOString(),
      error: 'Using default colors due to database error',
    };

    res.status(200).json(response);
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getColorConfig(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

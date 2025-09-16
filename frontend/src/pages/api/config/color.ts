import { logger } from '@/logger';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

async function getColorConfig(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the primary color from the database
    const colorConfig = await prisma.appConfig.findUnique({
      where: {
        key: 'primary_color',
      },
    });

    // If no color is configured, return the default color
    const primaryColor = colorConfig?.value || '#95E1D3';

    const response = {
      color: primaryColor,
      timestamp: new Date().toISOString(),
    };

    logger.info('Color config retrieved', { color: primaryColor });
    res.json(response);
  } catch (error) {
    logger.error(
      'Failed to retrieve color config',
      { error: (error as Error).message },
      error as Error,
    );

    // Return default color even if database fails
    const response = {
      color: '#95E1D3',
      timestamp: new Date().toISOString(),
      error: 'Using default color due to database error',
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

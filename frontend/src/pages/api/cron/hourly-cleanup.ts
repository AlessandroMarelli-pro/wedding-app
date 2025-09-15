import { logger } from '@/logger';
import { NextApiRequest, NextApiResponse } from 'next';
import { MaintenanceService } from '../../../../lib/maintenance';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Verify this is a Vercel Cron request
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only allow POST requests from Vercel Cron
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.logCron('hourly-cleanup', 'started');

    const maintenanceService = new MaintenanceService();

    // Clean temporary files older than 24 hours
    const deletedCount = await maintenanceService.cleanupTempFiles(24);

    logger.logCron('hourly-cleanup', 'completed', { deletedCount });

    res.status(200).json({
      success: true,
      message: 'Hourly cleanup completed successfully',
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.logCron('hourly-cleanup', 'failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Hourly cleanup failed',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

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
    logger.logCron('daily-cleanup', 'started');

    const maintenanceService = new MaintenanceService();

    // Clean orphaned files
    const result = await maintenanceService.cleanupOrphanedFiles();

    logger.logCron('daily-cleanup', 'completed', {
      orphanedFiles: result.orphanedFiles,
      freedSpace: result.freedSpace,
    });

    res.status(200).json({
      success: true,
      message: 'Daily cleanup completed successfully',
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.logCron('daily-cleanup', 'failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Daily cleanup failed',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

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
    logger.logCron('weekly-report', 'started');

    const maintenanceService = new MaintenanceService();

    // Generate storage usage report
    const report = await maintenanceService.generateStorageReport();

    logger.logCron('weekly-report', 'completed', {
      totalFiles: report.totalFiles,
      totalSize: report.totalSize,
    });

    res.status(200).json({
      success: true,
      message: 'Weekly storage report generated successfully',
      report,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.logCron('weekly-report', 'failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Weekly report failed',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

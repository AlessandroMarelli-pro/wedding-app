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
    console.log('🕐 Starting hourly cleanup cron job...');

    const maintenanceService = new MaintenanceService();

    // Clean temporary files older than 24 hours
    const deletedCount = await maintenanceService.cleanupTempFiles(24);

    console.log(`✅ Hourly cleanup completed: ${deletedCount} files cleaned`);

    res.status(200).json({
      success: true,
      message: 'Hourly cleanup completed successfully',
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Hourly cleanup cron job failed:', error);

    res.status(500).json({
      success: false,
      error: 'Hourly cleanup failed',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

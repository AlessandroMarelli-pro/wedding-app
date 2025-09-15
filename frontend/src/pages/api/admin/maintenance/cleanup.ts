import { NextApiRequest, NextApiResponse } from 'next';
import { MaintenanceService } from '../../../../../lib/maintenance';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';

async function cleanupTempFiles(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    const maintenanceService = new MaintenanceService();
    const olderThanHours = parseInt(req.query.hours as string) || 24;

    const deletedCount =
      await maintenanceService.cleanupTempFiles(olderThanHours);

    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} temporary files`,
      deletedCount,
      olderThanHours,
    });
  } catch (error: any) {
    console.error('Cleanup temp files error:', error);
    res.status(500).json({
      error: 'Failed to cleanup temporary files',
      details: error.message,
    });
  }
}

async function cleanupOrphanedFiles(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    const maintenanceService = new MaintenanceService();
    const result = await maintenanceService.cleanupOrphanedFiles();

    res.json({
      success: true,
      message: `Cleaned up ${result.orphanedFiles} orphaned files`,
      result,
    });
  } catch (error: any) {
    console.error('Cleanup orphaned files error:', error);
    res.status(500).json({
      error: 'Failed to cleanup orphaned files',
      details: error.message,
    });
  }
}

async function manualCleanup(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const maintenanceService = new MaintenanceService();
    const result = await maintenanceService.manualCleanup();

    res.json({
      success: true,
      message: 'Manual cleanup completed successfully',
      result,
    });
  } catch (error: any) {
    console.error('Manual cleanup error:', error);
    res.status(500).json({
      error: 'Failed to perform manual cleanup',
      details: error.message,
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      const { action } = req.query;

      switch (action) {
        case 'temp-files':
          return withAuth(cleanupTempFiles)(req, res);
        case 'orphaned-files':
          return withAuth(cleanupOrphanedFiles)(req, res);
        case 'manual':
          return withAuth(manualCleanup)(req, res);
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

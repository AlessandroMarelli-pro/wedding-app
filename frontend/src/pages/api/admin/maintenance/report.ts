import { NextApiRequest, NextApiResponse } from 'next';
import { MaintenanceService } from '../../../../../lib/maintenance';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';

async function generateStorageReport(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    const maintenanceService = new MaintenanceService();
    const report = await maintenanceService.generateStorageReport();

    res.json({
      success: true,
      message: 'Storage report generated successfully',
      report,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Generate storage report error:', error);
    res.status(500).json({
      error: 'Failed to generate storage report',
      details: error.message,
    });
  }
}

async function getStorageUsage(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    const maintenanceService = new MaintenanceService();
    const usage = await maintenanceService.getStorageUsage();

    res.json({
      success: true,
      usage,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Get storage usage error:', error);
    res.status(500).json({
      error: 'Failed to get storage usage',
      details: error.message,
    });
  }
}

async function validateUploadHealth(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    const maintenanceService = new MaintenanceService();
    const health = await maintenanceService.validateUploadHealth();

    res.json({
      success: true,
      health,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Validate upload health error:', error);
    res.status(500).json({
      error: 'Failed to validate upload health',
      details: error.message,
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const { action } = req.query;

      switch (action) {
        case 'storage-report':
          return withAuth(generateStorageReport)(req, res);
        case 'storage-usage':
          return withAuth(getStorageUsage)(req, res);
        case 'health':
          return withAuth(validateUploadHealth)(req, res);
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

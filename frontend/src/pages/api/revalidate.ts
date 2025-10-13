import { logger } from '@/logger';
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../lib/middleware';

async function revalidateHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    // Check if the request is authorized (you can add more specific checks here)
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { path } = req.body;

    // Validate the path to prevent abuse
    const allowedPaths = ['/', '/index'];
    if (!allowedPaths.includes(path)) {
      return res.status(400).json({ error: 'Invalid path' });
    }

    // Trigger revalidation for the home page
    await res.revalidate('/');

    logger.info('Page revalidated successfully', { path: '/' });

    return res.json({
      success: true,
      message: 'Page revalidated successfully',
      path: '/',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Revalidation error:', error as Error);
    return res.status(500).json({
      error: 'Failed to revalidate page',
      message: (error as Error).message,
    });
  }
}

export default withAuth(revalidateHandler);

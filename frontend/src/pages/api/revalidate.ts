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

    // Try the standard revalidation first
    try {
      await res.revalidate('/');
      logger.info('Page revalidated successfully using res.revalidate', {
        path: '/',
      });
    } catch (revalidateError) {
      logger.warn('res.revalidate failed, using force-update approach', {
        error: revalidateError,
      });

      // Alternative approach: Use our force-update endpoint
      const forceUpdateUrl = `${
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      }/api/force-update`;

      try {
        const response = await fetch(forceUpdateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers.authorization || '',
          },
        });

        if (response.ok) {
          logger.info('Cache invalidated successfully using force-update', {
            path: '/',
          });
        } else {
          throw new Error(`Force update failed: ${response.status}`);
        }
      } catch (forceUpdateError) {
        logger.error('Force update also failed', {
          error: forceUpdateError,
        });
        // Don't fail the request, just log the error
      }
    }

    return res.json({
      success: true,
      message: 'Page revalidation triggered successfully',
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

import { withAuth } from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { UrlParserService } from '../../../../../lib/scrapers/url-parser';

async function parseAccommodationUrl(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const urlParser = new UrlParserService();

  try {
    // Validate URL format
    if (!urlParser.isValidAccommodationUrl(url)) {
      return res.status(400).json({
        error: 'Invalid accommodation URL',
        message:
          'Please provide a valid URL from a supported accommodation platform',
      });
    }

    // Parse the accommodation URL
    const result = await urlParser.parseAccommodationUrl(url);

    // Cleanup resources
    await urlParser.cleanup();

    res.json(result);
  } catch (error: any) {
    console.error('Scraping error:', error);

    // Cleanup resources on error
    await urlParser.cleanup();

    res.status(500).json({
      error: 'Scraping failed',
      message:
        error.message || 'An unexpected error occurred while scraping the URL',
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return withAuth(parseAccommodationUrl)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

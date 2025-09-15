import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // This is a test endpoint to verify the proxy is working
  res.status(200).json({
    message: 'Proxy is working correctly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiUrl: process.env.API_URL ? 'Set' : 'Not set',
  });
}

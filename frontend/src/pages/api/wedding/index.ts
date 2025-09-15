import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

async function getWeddingInfo(req: NextApiRequest, res: NextApiResponse) {
  try {
    const weddingInfo = await prisma.weddingInfo.findFirst();

    if (!weddingInfo) {
      return res.status(404).json({ error: 'Wedding information not found' });
    }

    res.json(weddingInfo);
  } catch (error) {
    console.error('Get wedding info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getWeddingInfo(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

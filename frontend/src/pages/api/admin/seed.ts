import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../lib/middleware';
import { SeedService } from '../../../../lib/seed';

async function seedDatabase(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { reset } = req.query;

    if (reset === 'true') {
      await SeedService.resetDatabase();
    }

    await SeedService.seedStaticData();

    res.json({
      success: true,
      message: 'Database seeded successfully',
      reset: reset === 'true',
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({
      error: 'Seeding failed',
      details: error.message,
    });
  }
}

async function seedCustomData(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const seedData = req.body;

    await SeedService.seedCustomData(seedData);

    res.json({
      success: true,
      message: 'Custom data seeded successfully',
    });
  } catch (error: any) {
    console.error('Custom seed error:', error);
    res.status(500).json({
      error: 'Custom seeding failed',
      details: error.message,
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return withAuth(seedDatabase)(req, res);
    case 'PUT':
      return withAuth(seedCustomData)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

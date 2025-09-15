import { logger } from '@/logger';
import { NextApiRequest, NextApiResponse } from 'next';
import { comparePassword, generateToken } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

async function login(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      logger.logAuth('Login failed - user not found', undefined, { email });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isValidPassword = await comparePassword(password, admin.passwordHash);
    logger.debug('Password validation result', { email, isValidPassword });
    if (!isValidPassword) {
      logger.logAuth('Login failed - invalid password', admin.id, { email });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const accessToken = generateToken({
      adminId: admin.id,
      email: admin.email,
    });

    logger.logAuth('Login successful', admin.id, { email });

    res.json({
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    logger.error('Login error', { email: req.body?.email }, error as Error);
    res.status(500).json({ error });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return login(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

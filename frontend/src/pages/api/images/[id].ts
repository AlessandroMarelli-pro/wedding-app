import { UPLOAD_PATHS } from '@/services/upload';
import { UploadedImage } from '@prisma/client';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { prisma } from '../../../../lib/prisma';

function getImagePath(filename: string): string {
  return path.join(UPLOAD_PATHS.IMAGES, filename);
}

async function getImageById(id: string): Promise<UploadedImage> {
  const image = await prisma.uploadedImage.findUnique({
    where: { id },
    //relations: ['uploadedByAdmin'],
  });

  if (!image) {
    throw new Error(`Image with ID ${id} not found`);
  }

  return image;
}

async function getOptimizedImage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query as { id: string };
    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid image ID format');
    }

    // Get image metadata from database
    const image = await getImageById(id);

    // Try to find existing optimized version
    const optimizedFilename = `web_${image.filename.replace(/\.[^.]+$/, '.webp')}`;
    const optimizedPath = getImagePath(optimizedFilename);

    let finalPath = optimizedPath;
    let finalMimeType = 'image/webp'; // Optimized images are WebP

    // Check if file exists
    if (!fs.existsSync(finalPath)) {
      throw new Error('Image file not found on disk');
    }

    // Set appropriate headers
    res.setHeader('Content-Type', finalMimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('ETag', `"${image.id}-optimized"`);

    // Stream the file
    const fileStream = fs.createReadStream(finalPath);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on('error', (error) => {
      if (!res.headersSent) {
        res.status(500).json({
          error: 'File read error',
          message: 'Failed to read optimized image file',
        });
      }
    });

    res.json(image);
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getOptimizedImage(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

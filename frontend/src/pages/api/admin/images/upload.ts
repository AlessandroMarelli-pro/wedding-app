import { logger } from '@/logger';
import formidable from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import { validateAdminExists } from '../../../../../lib/admin-utils';
import { ImageProcessor } from '../../../../../lib/image-processor';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { FILE_TYPES, validateFile } from '../../../../../lib/upload';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};

async function initializeUploadSystem(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    const imageProcessor = new ImageProcessor();
    const exists = await imageProcessor.initializeUploadSystem();
    res.json({ message: 'done' });
  } catch (error: any) {
    logger.error('Check folder exists error:', error as Error);
    res.status(500).json({ error: 'Failed to check folder exists' });
  }
}

async function uploadImage(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const form = formidable({
      maxFileSize: FILE_TYPES.IMAGES.maxSize,
      filter: ({ mimetype }) => {
        logger.debug('File mimetype validation', { mimetype });
        return FILE_TYPES.IMAGES.mimeTypes.includes(mimetype as any);
      },
    });

    const [fields, files] = await form.parse(req);

    const file =
      (Array.isArray(files.file) ? files.file[0] : files.file) ||
      (Array.isArray(files.image) ? files.image[0] : files.image);

    if (!file) {
      logger.error('No file uploaded', { files: Object.keys(files) });
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file
    const validation = validateFile(
      file.originalFilename || '',
      file.mimetype || '',
      file.size,
      'IMAGES',
    );

    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Read file buffer
    const buffer = file.filepath
      ? require('fs').readFileSync(file.filepath)
      : Buffer.from('');

    if (buffer.length === 0) {
      return res.status(400).json({ error: 'File buffer is empty' });
    }

    // Get form fields
    const usageLocation = Array.isArray(fields.usageLocation)
      ? fields.usageLocation[0]
      : fields.usageLocation || 'general';

    const altText = Array.isArray(fields.altText)
      ? fields.altText[0]
      : fields.altText;

    // Validate admin exists before processing
    const adminValidation = await validateAdminExists(req.admin.id);
    if (!adminValidation.isValid) {
      logger.error(
        'Admin validation failed',
        { adminId: req.admin.id },
        new Error(adminValidation.error),
      );
      return res.status(400).json({
        error: 'Admin validation failed',
        details: adminValidation.error,
      });
    }

    // Process image
    const imageProcessor = new ImageProcessor();
    const result = await imageProcessor.uploadImage(
      {
        originalName: file.originalFilename || 'image.jpg',
        buffer,
        mimeType: file.mimetype || 'image/jpeg',
        usageLocation: usageLocation as string,
        altText: altText as string,
      },
      req.admin.id,
    );

    logger.logFileOperation(
      'upload',
      file.originalFilename || 'image.jpg',
      buffer.length,
      {
        adminId: req.admin.id,
        usageLocation,
      },
    );

    res.status(201).json(result);
  } catch (error: any) {
    logger.error(
      'Image upload error',
      { adminId: req.admin.id },
      error as Error,
    );
    res.status(500).json({
      error: 'Image upload failed',
      message: error.message,
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(initializeUploadSystem)(req, res);
    case 'POST':
      return withAuth(uploadImage)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

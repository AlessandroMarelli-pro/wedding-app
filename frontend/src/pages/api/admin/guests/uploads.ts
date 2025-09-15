import { CSVUpload, Guest } from '@prisma/client';
import formidable from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import { validateAdminExists } from '../../../../../lib/admin-utils';
import { CSVProcessor } from '../../../../../lib/csv-processor';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/prisma';
import { FILE_TYPES } from '../../../../../lib/upload';

import { logger } from '@/logger';
export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};

async function uploadGuestCSV(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const form = formidable({
      maxFileSize: FILE_TYPES.DOCUMENTS.maxSize,
      // Temporarily disable filter for testing
      // filter: ({ mimetype }) => {
      //   return FILE_TYPES.DOCUMENTS.mimeTypes.includes(mimetype || '');
      // },
    });

    const [fields, files] = await form.parse(req);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file - be more flexible with MIME types
    const filename = file.originalFilename || '';
    const mimeType = file.mimetype || '';
    const size = file.size;

    // Check file extension first (more reliable than MIME type)
    if (!filename.toLowerCase().endsWith('.csv')) {
      return res.status(400).json({ error: 'File must have a .csv extension' });
    }

    // Check file size
    if (size > FILE_TYPES.DOCUMENTS.maxSize) {
      return res.status(400).json({
        error: `File size exceeds limit of ${FILE_TYPES.DOCUMENTS.maxSize} bytes`,
      });
    }

    // Read file content
    const fileContent = file.filepath
      ? require('fs').readFileSync(file.filepath, 'utf-8')
      : '';

    if (!fileContent.trim()) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    // Validate admin exists before processing
    const adminValidation = await validateAdminExists(req.admin.id);
    if (!adminValidation.isValid) {
      logger.error(
        'Admin validation failed:',
        { adminId: req.admin.id },
        adminValidation.error,
      );
      return res.status(400).json({
        error: 'Admin validation failed',
        details: adminValidation.error,
      });
    }

    // Process CSV
    const csvProcessor = new CSVProcessor();
    const result = await csvProcessor.processCSVFile(
      fileContent,
      file.originalFilename || 'upload.csv',
      req.admin.id,
    );

    res.status(201).json(result);
  } catch (error: any) {
    logger.error('CSV upload error:', error as Error);

    if (error.message.includes('Invalid byte sequence')) {
      return res.status(400).json({
        error:
          'File encoding is not valid UTF-8. Please save your CSV file with UTF-8 encoding.',
      });
    }

    res.status(500).json({
      error: 'CSV upload failed',
      message: error.message,
    });
  }
}

async function getAllUploads(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const uploads = (await prisma.cSVUpload.findMany({
      orderBy: { createdAt: 'desc' },
      include: { guests: true },
    })) as (CSVUpload & { guests: Guest[] })[];
    const augmentedUploads = uploads.map((upload) => ({
      ...upload,
      successfulImports: upload.guests.length,
      totalGuests: upload.totalRows,
      guests: undefined,
    }));

    res.status(200).json(augmentedUploads);
  } catch (error) {
    logger.error('Get all uploads error:', error as Error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return withAuth(uploadGuestCSV)(req, res);
    case 'GET':
      return withAuth(getAllUploads)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

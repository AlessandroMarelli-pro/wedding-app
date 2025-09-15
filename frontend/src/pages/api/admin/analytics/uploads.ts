import { CSVUpload, UploadStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/prisma';

import { logger } from '@/logger';
/**
 * Analyze upload errors
 */
async function analyzeUploadErrors(uploads: CSVUpload[]) {
  const errorCounts: { [errorType: string]: number } = {};
  const errorByDate: { [date: string]: number } = {};
  let totalErrors = 0;

  uploads.forEach((upload) => {
    if (upload.errorLog) {
      try {
        const errorData = JSON.parse(upload.errorLog);

        // Count errors by type
        if (errorData.detailedErrors) {
          errorData.detailedErrors.forEach((error: any) => {
            const errorType = error.code || 'UNKNOWN';
            errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
            totalErrors++;
          });
        }

        // Count errors by date
        const date = upload.createdAt.toISOString().split('T')[0];
        errorByDate[date] = (errorByDate[date] || 0) + upload.errorRows;
      } catch (error) {
        // Handle old format or malformed error logs
        errorCounts['PARSING_ERROR'] =
          (errorCounts['PARSING_ERROR'] || 0) + upload.errorRows;
        totalErrors += upload.errorRows;
      }
    }
  });

  const commonErrors = Object.entries(errorCounts)
    .map(([errorType, count]) => ({
      errorType,
      count,
      percentage:
        totalErrors > 0 ? Math.round((count / totalErrors) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const errorTrends = Object.entries(errorByDate)
    .map(([date, errorCount]) => ({ date, errorCount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    commonErrors,
    errorTrends,
  };
}

async function getUploadStats(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const uploads = await prisma.cSVUpload.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const totalUploads = uploads.length;
    const successfulUploads = uploads.filter(
      (u) => u.status === UploadStatus.COMPLETED,
    ).length;
    const failedUploads = uploads.filter(
      (u) => u.status === UploadStatus.FAILED,
    ).length;

    const totalGuestsImported = uploads.reduce(
      (sum, upload) => sum + upload.processedRows,
      0,
    );
    const averageGuestsPerUpload =
      totalUploads > 0
        ? Math.round((totalGuestsImported / totalUploads) * 100) / 100
        : 0;

    const uploadHistory = uploads.map((upload) => ({
      filename: upload.filename,
      uploadDate: upload.createdAt,
      status: upload.status as UploadStatus,
      totalRows: upload.totalRows,
      processedRows: upload.processedRows,
      errorRows: upload.errorRows,
    }));

    // Analyze errors from failed uploads
    const errorAnalysis = analyzeUploadErrors(uploads);

    const stats = {
      totalUploads,
      successfulUploads,
      failedUploads,
      totalGuestsImported,
      averageGuestsPerUpload,
      uploadHistory,
      errorAnalysis,
    };

    res.json(stats);
  } catch (error) {
    logger.error('Get upload stats error:', error as Error);
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(getUploadStats)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

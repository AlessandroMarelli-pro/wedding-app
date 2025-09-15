import formidable from 'formidable';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

// Server-side environment variable (not exposed to browser)
const API_URL = process.env.API_URL || 'http://localhost:3001';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path || '';
  const targetUrl = `${API_URL}/api/${apiPath}`;

  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 20 * 1024 * 1024, // 20MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);

    // Create FormData for the backend request
    const formData = new FormData();

    // Add fields
    Object.entries(fields).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(key, v));
      } else {
        formData.append(key, value || '');
      }
    });

    // Add files - simplified for single file uploads
    Object.entries(files).forEach(([key, fileArray]: [string, any]) => {
      const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

      if (file?.filepath) {
        const fileBuffer = fs.readFileSync(file.filepath);
        const blob = new Blob([fileBuffer], {
          type: file.mimetype || 'application/octet-stream',
        });
        formData.append(key, blob, file.originalFilename || 'file');
      }
    });

    // Prepare headers
    const headers: Record<string, string> = {};

    // Forward authorization header if present
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    console.log('targetUrl', targetUrl);
    // Make the request to the backend
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    // Get response data
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Forward response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      if (
        !['content-encoding', 'transfer-encoding', 'connection'].includes(
          key.toLowerCase(),
        )
      ) {
        responseHeaders[key] = value;
      }
    });

    // Set response headers
    Object.entries(responseHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Set status and send response
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Upload proxy error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to proxy upload request to backend',
    });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';

// Server-side environment variable (not exposed to browser)
const API_URL = process.env.API_URL || 'http://localhost:3001';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { path } = req.query;

  // Reconstruct the path
  const apiPath = Array.isArray(path) ? path.join('/') : path || '';

  // Build the target URL
  const targetUrl = `${API_URL}/api/${apiPath}`;

  // Prepare headers for the proxy request
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Forward authorization header if present
  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }

  // Forward other relevant headers
  const headersToForward = [
    'user-agent',
    'accept',
    'accept-language',
    'accept-encoding',
    'cache-control',
    'connection',
    'upgrade',
    'sec-websocket-key',
    'sec-websocket-version',
    'sec-websocket-extensions',
    'sec-websocket-protocol',
  ];

  headersToForward.forEach((headerName) => {
    const headerValue = req.headers[headerName];
    if (headerValue && typeof headerValue === 'string') {
      headers[headerName] = headerValue;
    }
  });

  try {
    // Prepare request options
    const requestOptions: RequestInit = {
      method: req.method,
      headers,
    };

    // Add body for non-GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        // Skip multipart/form-data requests - they should be handled by the upload proxy
        return res.status(400).json({
          error: 'Bad Request',
          message:
            'Multipart form data should be sent to /api/upload/[...path]',
        });
      } else {
        requestOptions.body = JSON.stringify(req.body);
      }
    }

    // Make the request to the backend
    const response = await fetch(targetUrl, requestOptions);

    // Get response data
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('text/')) {
      data = await response.text();
    } else {
      // For binary data (like file downloads)
      data = await response.arrayBuffer();
    }

    // Forward response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      // Skip headers that shouldn't be forwarded
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
    res.status(response.status);

    if (data instanceof ArrayBuffer) {
      res.send(Buffer.from(data));
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to proxy request to backend',
    });
  }
}

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

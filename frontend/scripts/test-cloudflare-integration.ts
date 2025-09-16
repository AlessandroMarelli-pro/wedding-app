#!/usr/bin/env ts-node

import { ImageProcessor } from '../lib/image-processor';
import { logger } from '../lib/logger';

// Load environment variables
require('dotenv').config();

async function testCloudflareIntegration() {
  logger.info('Starting Cloudflare integration test');

  try {
    const imageProcessor = new ImageProcessor();

    // Test with a simple image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );

    const testImageData = {
      originalName: 'test-image.png',
      buffer: testImageBuffer,
      mimeType: 'image/png',
      usageLocation: 'test',
      altText: 'Test image for Cloudflare integration',
    };

    logger.info('Testing image upload with Cloudflare integration');

    const result = await imageProcessor.uploadImage(
      testImageData,
      'test-admin-id',
    );

    logger.info('Image upload test completed', {
      imageId: result.id,
      filename: result.filename,
      cloudflareUrl: result.cloudflareUrl,
      cloudflareKey: result.cloudflareKey,
    });

    // Test image retrieval
    logger.info('Testing image retrieval');
    const imageFile = await imageProcessor.getImageFile(result.id);

    logger.info('Image retrieval test completed', {
      hasCloudflareUrl: !!imageFile.cloudflareUrl,
      cloudflareUrl: imageFile.cloudflareUrl,
      mimeType: imageFile.mimeType,
    });

    // Test image deletion
    logger.info('Testing image deletion');
    await imageProcessor.deleteImage(result.id);

    logger.info('Image deletion test completed');

    logger.info('Cloudflare integration test completed successfully');
  } catch (error: any) {
    logger.error('Cloudflare integration test failed', {}, error);
    process.exit(1);
  }
}

// Run the test
testCloudflareIntegration().catch((error) => {
  logger.error('Test execution failed', {}, error);
  process.exit(1);
});

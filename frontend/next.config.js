/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Webpack configuration for SVG optimization
  webpack: (config, { dev, isServer }) => {
    // SVG optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      // Keep viewBox for responsive SVGs
                      removeViewBox: false,
                      // Keep IDs if they're used for styling
                      cleanupIds: {
                        remove: false,
                        minify: true,
                      },
                    },
                  },
                },
                // Additional optimizations
                'removeDimensions',
                'removeMetadata',
                'removeComments',
                'removeEmptyContainers',
                'removeUselessDefs',
                'removeUselessStrokeAndFill',
                'removeHiddenElems',
                'removeEmptyText',
                'removeEmptyAttrs',
                'removeEditorsNSData',
                'removeXMLProcInst',
                'removeDoctype',
                'removeRasterImages',
                'removeUnknownsAndDefaults',
                'removeNonInheritableGroupAttrs',
                'cleanupNumericValues',
                'convertColors',
                'convertPathData',
                'convertTransform',
                'inlineStyles',
                'mergePaths',
                'minifyStyles',
                'removeDesc',
                'removeTitle',
                'sortAttrs',
              ],
            },
          },
        },
      ],
    });

    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          svg: {
            test: /\.svg$/,
            name: 'svg',
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Compression
  compress: true,

  // Power by header
  poweredByHeader: false,

  // Generate ETags
  generateEtags: true,
};

module.exports = nextConfig;

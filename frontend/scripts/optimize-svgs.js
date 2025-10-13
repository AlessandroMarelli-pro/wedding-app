#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo');

// Configuration for SVG optimization
const svgoConfig = {
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
};

// Directories to process
const svgDirectories = [
  path.join(__dirname, '../public/images'),
  path.join(__dirname, '../public/icons'),
  // Add more directories as needed
];

// Function to optimize a single SVG file
function optimizeSvgFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(originalContent, 'utf8');

    const result = optimize(originalContent, svgoConfig);

    if (result.error) {
      console.error(`❌ Error optimizing ${filePath}:`, result.error);
      return;
    }

    const optimizedContent = result.data;
    const optimizedSize = Buffer.byteLength(optimizedContent, 'utf8');
    const savings = originalSize - optimizedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

    // Write optimized content back to file
    fs.writeFileSync(filePath, optimizedContent, 'utf8');

    console.log(
      `✅ ${path.basename(filePath)}: ${originalSize} → ${optimizedSize} bytes (${savingsPercent}% saved)`,
    );
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Function to find and optimize all SVG files
function optimizeAllSvgs() {
  console.log('🚀 Starting SVG optimization...\n');

  let totalFiles = 0;
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  svgDirectories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      console.log(`⚠️  Directory not found: ${dir}`);
      return;
    }

    console.log(`📁 Processing directory: ${dir}`);

    const files = fs.readdirSync(dir);
    const svgFiles = files.filter((file) =>
      file.toLowerCase().endsWith('.svg'),
    );

    svgFiles.forEach((file) => {
      const filePath = path.join(dir, file);
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const originalSize = Buffer.byteLength(originalContent, 'utf8');

      optimizeSvgFile(filePath);

      totalFiles++;
      totalOriginalSize += originalSize;

      const optimizedContent = fs.readFileSync(filePath, 'utf8');
      const optimizedSize = Buffer.byteLength(optimizedContent, 'utf8');
      totalOptimizedSize += optimizedSize;
    });
  });

  const totalSavings = totalOriginalSize - totalOptimizedSize;
  const totalSavingsPercent = (
    (totalSavings / totalOriginalSize) *
    100
  ).toFixed(1);

  console.log('\n📊 Optimization Summary:');
  console.log(`   Files processed: ${totalFiles}`);
  console.log(
    `   Total size: ${totalOriginalSize} → ${totalOptimizedSize} bytes`,
  );
  console.log(
    `   Total savings: ${totalSavings} bytes (${totalSavingsPercent}%)`,
  );
  console.log('\n✅ SVG optimization complete!');
}

// Run the optimization
optimizeAllSvgs();

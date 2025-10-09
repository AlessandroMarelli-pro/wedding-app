const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_SVG = path.join(__dirname, '../public/images/aqua.svg');
const OUTPUT_SVG = path.join(__dirname, '../public/images/aqua-animated.svg');
const ANIMATION_CLASSES = 16;
const DURATION = 5000;
const DELAY = 500;

function pregenerateAnimatedSVG() {
  try {
    console.log('🎨 Pre-generating animated SVG...');

    // Read the original SVG
    const svgContent = fs.readFileSync(INPUT_SVG, 'utf8');
    console.log(`📖 Read SVG with ${svgContent.length} characters`);

    let processedContent = svgContent;

    // Add class and style to SVG element
    processedContent = processedContent.replace(
      /<svg([^>]*)>/,
      `<svg$1 class="animated-svg w-full h-full" style="--animation-duration: ${DURATION}ms; --animation-delay: ${DELAY}ms; width: 100%; height: 100%;">`,
    );

    // Get all path elements
    const pathMatches = processedContent.match(/<path[^>]*>/g);
    if (!pathMatches) {
      console.error('❌ No path elements found in SVG');
      return;
    }

    console.log(`🎯 Found ${pathMatches.length} path elements`);

    // Assign animation classes to paths with better distribution
    let processedPaths = 0;
    let classIndex = 1;

    pathMatches.forEach((pathMatch) => {
      // Extract original fill from style attribute if present
      const styleMatch = pathMatch.match(/style="([^"]*)"/);
      let originalFill = '#000'; // default color
      
      if (styleMatch) {
        const fillMatch = styleMatch[1].match(/fill:\s*([^;]+)/);
        if (fillMatch) {
          originalFill = fillMatch[1].trim();
        }
      }
      
      // Use round-robin distribution for more even distribution
      const animatedPath = pathMatch.replace(
        '<path',
        `<path class="animated-path-${classIndex}" style="--original-fill: ${originalFill}; ${styleMatch ? styleMatch[1] : ''}"`,
      );
      processedContent = processedContent.replace(pathMatch, animatedPath);
      processedPaths++;

      // Move to next class in round-robin fashion
      classIndex = (classIndex % ANIMATION_CLASSES) + 1;
    });

    console.log(
      `✨ Processed ${processedPaths} paths with round-robin animation classes`,
    );

    // Write the processed SVG
    fs.writeFileSync(OUTPUT_SVG, processedContent, 'utf8');

    console.log(`✅ Animated SVG generated successfully!`);
    console.log(`📁 Output: ${OUTPUT_SVG}`);
    console.log(`📊 Stats:`);
    console.log(`   - Total paths: ${pathMatches.length}`);
    console.log(`   - Animation classes: ${ANIMATION_CLASSES}`);
    console.log(`   - Duration: ${DURATION}ms`);
    console.log(`   - Base delay: ${DELAY}ms`);

    // Generate class distribution stats
    const classDistribution = {};
    for (let i = 1; i <= ANIMATION_CLASSES; i++) {
      const classCount = (
        processedContent.match(new RegExp(`animated-path-${i}`, 'g')) || []
      ).length;
      classDistribution[i] = classCount;
    }

    console.log(`📈 Class distribution:`);
    Object.entries(classDistribution).forEach(([classNum, count]) => {
      const percentage = ((count / pathMatches.length) * 100).toFixed(1);
      console.log(
        `   - animated-path-${classNum}: ${count} paths (${percentage}%)`,
      );
    });
  } catch (error) {
    console.error('❌ Error pre-generating animated SVG:', error);
    process.exit(1);
  }
}

// Run the script
pregenerateAnimatedSVG();

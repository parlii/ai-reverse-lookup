const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateFavicon() {
  try {
    // Create the scripts directory if it doesn't exist
    const scriptsDir = path.join(__dirname);
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    // Path to the SVG file
    const svgPath = path.join(__dirname, '../public/favicon.svg');

    // Check if SVG exists
    if (!fs.existsSync(svgPath)) {
      console.error('SVG file not found:', svgPath);
      return;
    }

    // Generate different sizes for the favicon
    const sizes = [16, 32, 48, 64, 128, 256];
    const pngBuffers = await Promise.all(
      sizes.map(size =>
        sharp(svgPath)
          .resize(size, size)
          .png()
          .toBuffer()
      )
    );

    // Write each size to a PNG file
    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      const pngPath = path.join(__dirname, `../public/favicon-${size}.png`);
      fs.writeFileSync(pngPath, pngBuffers[i]);
      console.log(`Generated ${pngPath}`);
    }

    console.log('Favicon generation complete!');
    console.log('Please use a web-based ICO converter to create favicon.ico from the PNG files.');
    console.log('Then replace the placeholder favicon.ico in the public directory.');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon(); 
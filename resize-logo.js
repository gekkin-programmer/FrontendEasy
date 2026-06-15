const sharp = require('sharp');
const fs = require('fs');

const inputFile = 'public/assets/WiggleLogo.png'; 
const outputFile = 'public/assets/app-icon-1024.png'; 

// Ensure input exists
if (!fs.existsSync(inputFile)) {
  console.error(`❌ Error: Could not find ${inputFile}`);
  process.exit(1);
}

sharp(inputFile)
  .resize(1024, 1024, {
    fit: 'contain', // Keeps aspect ratio, doesn't stretch
    background: { r: 255, g: 255, b: 255, alpha: 1 } // White background (Recommended for Meta)
    // Use { r: 0, g: 0, b: 0, alpha: 0 } for transparent
  })
  .toFormat('png')
  .toFile(outputFile)
  .then(info => {
    console.log(`✅ Success! Created ${outputFile}`);
    console.log(`Dimensions: ${info.width}x${info.height}`);
    console.log(`Size: ${(info.size / 1024).toFixed(2)} KB`);
  })
  .catch(err => {
    console.error("Error resizing:", err);
  });
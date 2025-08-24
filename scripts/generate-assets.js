const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Ensure assets directory exists
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Function to create a simple placeholder image
function createPlaceholderImage(width, height, text, filename) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#0EA5E9';
  ctx.fillRect(0, 0, width, height);

  // Add text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${Math.min(width, height) / 10}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, filename), buffer);
  console.log(`Created ${filename}`);
}

// Generate the required assets
createPlaceholderImage(1024, 1024, 'InvestPro', 'icon.png');
createPlaceholderImage(1024, 1024, 'InvestPro', 'adaptive-icon.png');
createPlaceholderImage(1242, 2436, 'InvestPro', 'splash.png');

console.log('All assets generated successfully!');

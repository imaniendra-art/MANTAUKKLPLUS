const sharp = require('sharp');
const fs = require('fs');

async function processImage() {
  const inputPath = 'public/mm.png';
  const outputPath = 'public/mm_white.png';
  
  if (!fs.existsSync(inputPath)) {
    console.error('File not found:', inputPath);
    return;
  }

  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    // Check if pixel is dark (navy/black)
    if (r < 80 && g < 100 && b < 150 && a > 0) {
      // Make it white
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  })
  .png()
  .toFile(outputPath);
  
  console.log('Image processed and saved to', outputPath);
}

processImage().catch(console.error);

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create Brand SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a1628"/>
      <stop offset="100%" stop-color="#1a2a4a"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e8d5a3"/>
      <stop offset="50%" stop-color="#c9a84c"/>
      <stop offset="100%" stop-color="#a8893a"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#bgGrad)"/>
  <rect x="24" y="24" width="464" height="464" rx="80" fill="none" stroke="url(#goldGrad)" stroke-width="8" opacity="0.6"/>
  <!-- Book and Tech Icon -->
  <g transform="translate(96, 96)">
    <!-- Monitor Base -->
    <rect x="20" y="20" width="280" height="190" rx="18" fill="#112240" stroke="url(#goldGrad)" stroke-width="10"/>
    <rect x="36" y="36" width="248" height="158" rx="8" fill="#07101e"/>
    <!-- Code / Data lines -->
    <rect x="60" y="60" width="90" height="12" rx="6" fill="#c9a84c"/>
    <rect x="60" y="85" width="140" height="10" rx="5" fill="#e8d5a3" opacity="0.8"/>
    <rect x="60" y="105" width="110" height="10" rx="5" fill="#e8d5a3" opacity="0.8"/>
    <rect x="60" y="125" width="180" height="10" rx="5" fill="#27ae60"/>
    <rect x="60" y="145" width="70" height="10" rx="5" fill="#c9a84c"/>
    <!-- Monitor stand -->
    <path d="M130 210 L190 210 L205 260 L115 260 Z" fill="url(#goldGrad)"/>
    <rect x="90" y="255" width="140" height="16" rx="8" fill="#c9a84c"/>
    <!-- Graduation Cap / Book Emblem -->
    <circle cx="250" cy="220" r="42" fill="#0a1628" stroke="url(#goldGrad)" stroke-width="6"/>
    <path d="M225 215 L250 202 L275 215 L250 228 Z" fill="#c9a84c"/>
    <polygon points="235,220 235,235 250,242 265,235 265,220 250,228" fill="#e8d5a3"/>
    <path d="M272 216 L278 226 L278 238" stroke="#c9a84c" stroke-width="3" fill="none"/>
  </g>
  <text x="256" y="445" font-family="'Inter', sans-serif" font-size="34" font-weight="900" fill="#e8d5a3" text-anchor="middle" letter-spacing="3">MEDUCA · TECH</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');

// Function to generate raw uncompressed PNG with pure Node.js
function createPNG(width, height, isMaskable = false) {
  // Simple PNG encoder
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // color type 6: RGBA
  ihdrData.writeUInt8(0, 10); // compression method
  ihdrData.writeUInt8(0, 11); // filter method
  ihdrData.writeUInt8(0, 12); // interlace method
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data: filter byte (0) + width * 4 bytes per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  // Draw icon pattern: deep blue background with gold accents and emblem
  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width * 0.38 : width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const px = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background gradient from dark navy (#0a1628) to deep navy (#1a2a4a)
      const gradT = (x + y) / (width + height);
      let r = Math.round(10 + gradT * 16);
      let g = Math.round(22 + gradT * 20);
      let b = Math.round(40 + gradT * 34);
      let a = 255;

      // Outer gold circle ring
      if (Math.abs(dist - radius) < (width * 0.02)) {
        r = 201; g = 168; b = 76; // #c9a84c gold
      } else if (dist < radius) {
        // Inner emblem area
        // Draw screen box in center
        const boxW = width * 0.44;
        const boxH = height * 0.32;
        const inBox = Math.abs(dx) < boxW / 2 && Math.abs(dy + height * 0.04) < boxH / 2;
        const inBoxBorder = Math.abs(dx) < (boxW / 2 + 3) && Math.abs(dy + height * 0.04) < (boxH / 2 + 3) && !inBox;

        if (inBoxBorder) {
          r = 201; g = 168; b = 76;
        } else if (inBox) {
          r = 7; g = 16; b = 30; // screen dark
          // Horizontal bars inside screen
          const relY = dy + height * 0.04;
          if (relY > -boxH * 0.3 && relY < -boxH * 0.15 && dx > -boxW * 0.35 && dx < boxW * 0.1) {
            r = 201; g = 168; b = 76; // gold bar
          } else if (relY > -boxH * 0.05 && relY < boxH * 0.08 && dx > -boxW * 0.35 && dx < boxW * 0.3) {
            r = 39; g = 174; b = 96; // green bar
          } else if (relY > boxH * 0.16 && relY < boxH * 0.28 && dx > -boxW * 0.35 && dx < boxW * 0.2) {
            r = 232; g = 213; b = 163; // light gold bar
          }
        } else if (dy > height * 0.18 && dy < height * 0.26 && Math.abs(dx) < width * 0.18) {
          // Monitor stand
          r = 201; g = 168; b = 76;
        }
      }

      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
      rawData[px + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcData = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// CRC32 implementation
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

// Generate the required files:
// 1. apple-touch-icon.png (180x180)
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, false));
// 2. pwa-192x192.png
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, false));
// 3. pwa-512x512.png
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, false));
// 4. pwa-maskable-512x512.png (with 15% safe padding)
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));

console.log('✅ PWA Icons successfully generated in public/ directory!');

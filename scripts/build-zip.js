import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function buildZip() {
  console.log('Building SAY-AI-FULL-CLOUDFLARE-PROJECT.zip...');
  const zip = new JSZip();

  function addFolderToZip(folderPath, zipFolder) {
    const items = fs.readdirSync(folderPath);

    for (const item of items) {
      if (
        item === 'node_modules' ||
        item === '.git' ||
        item === 'dist' ||
        item === '.playwright-cli' ||
        item === 'bun.lock' ||
        item.endsWith('.zip')
      ) {
        continue;
      }

      const fullPath = path.join(folderPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const subZip = zipFolder.folder(item);
        addFolderToZip(fullPath, subZip);
      } else {
        const content = fs.readFileSync(fullPath);
        zipFolder.file(item, content);
      }
    }
  }

  addFolderToZip('.', zip);

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  // Ensure public folder exists
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }

  fs.writeFileSync('public/SAY-AI-FULL-CLOUDFLARE-PROJECT.zip', buffer);
  fs.writeFileSync('SAY-AI-FULL-CLOUDFLARE-PROJECT.zip', buffer);

  console.log(`✅ Successfully generated SAY-AI-FULL-CLOUDFLARE-PROJECT.zip (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
}

buildZip().catch(console.error);

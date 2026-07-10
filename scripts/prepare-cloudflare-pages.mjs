import fs from 'fs';
import path from 'path';

const openNextDir = path.join(process.cwd(), '.open-next');
const assetsDir = path.join(openNextDir, 'assets');
const workerDir = path.join(assetsDir, '_worker.js');

if (!fs.existsSync(openNextDir)) {
  console.error('.open-next directory not found. Did the build fail?');
  process.exit(1);
}

// Create the _worker.js directory inside assets
if (!fs.existsSync(workerDir)) {
  fs.mkdirSync(workerDir, { recursive: true });
}

// Move everything from .open-next to .open-next/assets/_worker.js EXCEPT the assets directory itself
const items = fs.readdirSync(openNextDir);

for (const item of items) {
  if (item === 'assets') continue;

  const sourcePath = path.join(openNextDir, item);
  let destPath = path.join(workerDir, item);
  
  // worker.js should be renamed to index.js to act as the Cloudflare Pages Advanced Mode entrypoint
  if (item === 'worker.js') {
    destPath = path.join(workerDir, 'index.js');
  }

  fs.renameSync(sourcePath, destPath);
}

console.log('Successfully prepared Cloudflare Pages output in .open-next/assets');

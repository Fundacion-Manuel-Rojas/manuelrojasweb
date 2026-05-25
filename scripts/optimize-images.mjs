import { readdir, stat, unlink, writeFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const MEDIA_DIR = 'public/media';
const WEBP_QUALITY = 80;
const MAX_WIDTH = 1920;

async function findImages(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await findImages(fullPath));
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

async function convertToWebP(filePath) {
  const ext = extname(filePath);
  const webpPath = filePath.replace(ext, '.webp');

  try {
    const originalSize = (await stat(filePath)).size;

    const { stdout } = await execAsync(`identify -format "%w" "${filePath}"`);
    const width = parseInt(stdout.trim());

    let resizeArg = '';
    if (width > MAX_WIDTH) {
      resizeArg = `-resize ${MAX_WIDTH}x`;
    }

    await execAsync(`convert "${filePath}" ${resizeArg} -quality ${WEBP_QUALITY} "${webpPath}"`);

    const newSize = (await stat(webpPath)).size;
    const saved = originalSize - newSize;
    const pct = ((saved / originalSize) * 100).toFixed(1);

    await unlink(filePath);

    return {
      original: filePath,
      webp: webpPath,
      originalSize,
      newSize,
      saved,
      pct
    };
  } catch (err) {
    console.error(`  Error: ${basename(filePath)}: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('Buscando imágenes...');
  const images = await findImages(MEDIA_DIR);
  console.log(`Encontradas ${images.length} imágenes para convertir\n`);

  const results = [];
  let totalSaved = 0;

  for (const img of images) {
    const result = await convertToWebP(img);
    if (result) {
      results.push(result);
      totalSaved += result.saved;
      console.log(`  ${basename(result.original)}: ${result.pct}% (${(result.saved/1024).toFixed(0)}KB)`);
    }
  }

  console.log(`\n=== Resumen ===`);
  console.log(`Convertidas: ${results.length} imágenes`);
  console.log(`Total ahorrado: ${(totalSaved / 1048576).toFixed(1)} MB`);

  const mapping = {};
  for (const r of results) {
    const origName = basename(r.original);
    const webpName = basename(r.webp);
    mapping[origName] = webpName;
  }
  await writeFile('scripts/image-mapping.json', JSON.stringify(mapping, null, 2));
  console.log(`\nMapping guardado en scripts/image-mapping.json`);
}

main().catch(console.error);

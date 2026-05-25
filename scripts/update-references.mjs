import { readdir, readFile, writeFile } from 'fs/promises';
import { join, basename } from 'path';

const SRC_DIR = 'src';
const MAPPING_FILE = 'scripts/image-mapping.json';

async function findAstroFiles(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await findAstroFiles(fullPath));
    } else if (/\.(astro|mdoc|ts)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

async function main() {
  const mapping = JSON.parse(await readFile(MAPPING_FILE, 'utf-8'));

  const extMap = {};
  for (const [origName, webpName] of Object.entries(mapping)) {
    const ext = origName.match(/\.(jpe?g|png)$/i)?.[0];
    if (ext) {
      const baseName = origName.replace(ext, '');
      extMap[baseName + ext] = baseName + '.webp';
      if (ext === '.jpg') {
        extMap[baseName + '.jpeg'] = baseName + '.webp';
      }
    }
  }

  console.log('Buscando archivos .astro/.mdoc/.ts...');
  const files = await findAstroFiles(SRC_DIR);
  console.log(`Encontrados ${files.length} archivos\n`);

  let totalReplacements = 0;
  let filesModified = 0;

  for (const file of files) {
    let content = await readFile(file, 'utf-8');
    let replacements = 0;

    for (const [oldRef, newRef] of Object.entries(extMap)) {
      const regex = new RegExp(oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newRef);
        replacements += matches.length;
      }
    }

    if (replacements > 0) {
      await writeFile(file, content, 'utf-8');
      filesModified++;
      totalReplacements += replacements;
      console.log(`  ${file}: ${replacements} reemplazos`);
    }
  }

  console.log(`\n=== Resumen ===`);
  console.log(`Archivos modificados: ${filesModified}`);
  console.log(`Total reemplazos: ${totalReplacements}`);
}

main().catch(console.error);

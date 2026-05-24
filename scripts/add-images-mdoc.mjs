import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'noticias');

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, '')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFirstImage(content) {
  const match = content.match(/<img[^>]*src="([^"]+)"/);
  return match ? match[1] : null;
}

function extractExcerpt(html, maxLen = 200) {
  const text = stripHtml(html);
  if (text.length <= maxLen) return text;
  // Cut at last space before maxLen
  const cut = text.substring(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 100 ? cut.substring(0, lastSpace) : cut) + '…';
}

async function main() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdoc'));

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Parse frontmatter and body
    const parts = content.split('---');
    if (parts.length < 3) {
      console.log(`SKIP ${file}: invalid format`);
      continue;
    }

    const frontmatter = parts[1];
    const body = parts.slice(2).join('---');

    // Skip if already has imagen
    if (/^imagen:/m.test(frontmatter)) {
      console.log(`SKIP ${file}: already has imagen`);
      continue;
    }

    // Extract first image
    const img = extractFirstImage(body);
    const extracto = extractExcerpt(body, 200);

    // Build new frontmatter
    let newFrontmatter = frontmatter.trimEnd();
    if (img) {
      newFrontmatter += `\nimagen: ${img}`;
    }
    newFrontmatter += `\nextracto: "${extracto.replace(/"/g, '\\"')}"`;

    const newContent = `---\n${newFrontmatter}\n---\n\n${body.trimStart()}`;
    fs.writeFileSync(filePath, newContent);
    console.log(`OK ${file}: img=${img ? 'yes' : 'no'}, extracto=${extracto.length}chars`);
  }

  console.log(`\nDone! ${files.length} files processed`);
}

main().catch(console.error);

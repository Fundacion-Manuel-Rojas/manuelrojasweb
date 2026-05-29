import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTICIAS_DIR = path.join(__dirname, '../src/content/noticias');

function cleanContent(content) {
  let result = content;

  result = result.replace(/<!--[\s\S]*?-->/g, '');

  result = result.replace(/<p[^>]*>/gi, '');
  result = result.replace(/<\/p>/gi, '\n\n');

  result = result.replace(/<br\s*\/?>/gi, '\n');

  result = result.replace(/<div[^>]*>/gi, '\n\n');
  result = result.replace(/<\/div>/gi, '\n');

  result = result.replace(/<address[^>]*>/gi, '\n');
  result = result.replace(/<\/address>/gi, '\n');

  result = result.replace(/<h([1-6])[^>]*>/gi, '\n\n<h$1>');
  result = result.replace(/<\/h[1-6]>/gi, '</h$1>\n');

  result = result.replace(/<strong[^>]*>/gi, '**');
  result = result.replace(/<\/strong>/gi, '**');
  result = result.replace(/<em[^>]*>/gi, '_');
  result = result.replace(/<\/em>/gi, '_');

  result = result.replace(/<a[^>]*href="([^"]*)"[^>]*title="([^"]*)"[^>]*>/gi, '[$2]($1)');
  result = result.replace(/<a[^>]*href="([^"]*)"[^>]*>/gi, '[$1](');
  result = result.replace(/<\/a>/gi, ')');

  result = result.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![$1]($2)');
  result = result.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
  result = result.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)');

  result = result.replace(/<figure[^>]*>/gi, '\n\n');
  result = result.replace(/<\/figure>/gi, '\n');
  result = result.replace(/<figcaption[^>]*>/gi, '');
  result = result.replace(/<\/figcaption>/gi, '');

  result = result.replace(/<blockquote[^>]*>/gi, '\n\n> ');
  result = result.replace(/<\/blockquote>/gi, '\n');

  result = result.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');

  result = result.replace(/<iframe[^>]*>.*?<\/iframe>/gis, '');

  result = result.replace(/<ul[^>]*>/gi, '\n<ul>');
  result = result.replace(/<\/ul>/gi, '</ul>\n');
  result = result.replace(/<ol[^>]*>/gi, '\n<ol>');
  result = result.replace(/<\/ol>/gi, '</ol>\n');
  result = result.replace(/<li[^>]*>/gi, '<li>');
  result = result.replace(/<\/li>/gi, '</li>\n');

  result = result.replace(/fetchpriority="[^"]*"/gi, '');
  result = result.replace(/decoding="[^"]*"/gi, '');
  result = result.replace(/class="[^"]*"/gi, '');
  result = result.replace(/style="[^"]*"/gi, '');
  result = result.replace(/id="[^"]*"/gi, '');
  result = result.replace(/width="[^"]*"/gi, '');
  result = result.replace(/height="[^"]*"/gi, '');
  result = result.replace(/<span[^>]*>/gi, '');
  result = result.replace(/<\/span>/gi, '');

  result = result.replace(/&nbsp;/g, ' ');
  result = result.replace(/&amp;/g, '&');
  result = result.replace(/&lt;/g, '<');
  result = result.replace(/&gt;/g, '>');
  result = result.replace(/&quot;/g, '"');

  result = result.replace(/<[^>]+>/g, '');

  result = result.replace(/^\s*\n+/gm, '\n');

  result = result.replace(/\n{3,}/g, '\n\n');

  result = result.replace(/^\s*\n+/, '');
  result = result.replace(/\n+\s*$/, '\n');

  return result.trim();
}

function processFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8');

  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!frontmatterMatch) {
    console.log(`Skipping ${path.basename(filepath)} - no valid frontmatter`);
    return;
  }

  const frontmatter = frontmatterMatch[1];
  let body = frontmatterMatch[2];

  body = cleanContent(body);

  const newContent = `---\n${frontmatter}\n---\n${body}\n`;

  fs.writeFileSync(filepath, newContent, 'utf-8');
  console.log(`Cleaned ${path.basename(filepath)}`);
}

const files = fs.readdirSync(NOTICIAS_DIR).filter(f => f.endsWith('.mdoc'));

console.log(`Found ${files.length} mdoc files\n`);

files.forEach(file => {
  processFile(path.join(NOTICIAS_DIR, file));
});

console.log(`\nDone! Cleaned ${files.length} files.`);
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const PAGES_DIR = 'src/pages';

function walkDir(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (entry.name.endsWith('.astro')) {
      results.push(fullPath);
    }
  }
  return results;
}

function convertBreadcrumb(h3) {
  let html = '';
  for (const child of h3.childNodes) {
    if (child.nodeType === 3) {
      html += child.textContent;
    } else if (child.nodeType === 1) {
      if (child.tagName === 'SPAN') {
        html += `<span class="text-gray-500">${child.innerHTML}</span>`;
      } else if (child.tagName === 'A') {
        const href = child.getAttribute('href') || '';
        html += `<a href="${href}" class="text-blue-500 hover:underline">${child.textContent}</a>`;
      } else {
        html += child.outerHTML;
      }
    }
  }
  return html;
}

function applyTailwindClasses(doc) {
  const h3s = doc.querySelectorAll('h3');
  for (const h3 of h3s) {
    const hasSpan = h3.querySelector('span');
    const hasLink = h3.querySelector('a');
    if (hasSpan || hasLink) {
      h3.setAttribute('class', 'text-lg text-gray-400 mb-6 pt-6 pb-3 border-b border-gray-200');
      h3.innerHTML = convertBreadcrumb(h3);
    } else {
      h3.setAttribute('class', 'text-2xl font-semibold text-gray-700 mb-3');
    }
  }

  for (const el of doc.querySelectorAll('h1')) {
    el.setAttribute('class', 'text-3xl font-bold text-gray-800 mb-6');
  }
  for (const el of doc.querySelectorAll('h2')) {
    el.setAttribute('class', 'text-2xl font-bold text-gray-800 mb-4 mt-8');
  }
  for (const el of doc.querySelectorAll('h4')) {
    el.setAttribute('class', 'text-lg font-semibold text-gray-700 mb-2');
  }
  for (const el of doc.querySelectorAll('h5')) {
    el.setAttribute('class', 'text-base font-semibold text-gray-700 mb-2');
  }
  for (const el of doc.querySelectorAll('h6')) {
    el.setAttribute('class', 'text-sm font-semibold text-gray-600 mb-1');
  }

  for (const el of doc.querySelectorAll('p')) {
    if (el.closest('blockquote') || el.closest('li') || el.closest('td')) continue;
    if (el.classList.contains('dropcap')) {
      el.setAttribute('class', 'mb-4 leading-relaxed text-gray-600 first-letter:float-left first-letter:text-5xl first-letter:font-bold first-letter:mr-2 first-letter:leading-tight first-letter:text-gray-800');
    } else {
      el.setAttribute('class', 'mb-4 leading-relaxed text-gray-600');
    }
    el.removeAttribute('style');
    el.removeAttribute('align');
  }

  for (const el of doc.querySelectorAll('a')) {
    const existingClass = el.getAttribute('class') || '';
    if (!existingClass.includes('book-') && !existingClass.includes('entry-') && !existingClass.includes('social-')) {
      el.setAttribute('class', 'text-blue-500 hover:underline');
    }
    el.removeAttribute('title');
  }

  for (const el of doc.querySelectorAll('img')) {
      el.setAttribute('class', 'rounded-lg border border-gray-300 shadow-sm max-w-full h-auto my-4 mx-auto block');
    el.removeAttribute('width');
    el.removeAttribute('height');
    el.removeAttribute('aria-describedby');
    el.removeAttribute('data-et-multi-view');
    el.removeAttribute('data-src');
  }

  for (const el of doc.querySelectorAll('ul')) {
    el.setAttribute('class', 'list-disc pl-6 mb-4 space-y-1 text-gray-600');
  }
  for (const el of doc.querySelectorAll('ol')) {
    el.setAttribute('class', 'list-decimal pl-6 mb-4 space-y-1 text-gray-600');
  }

  for (const el of doc.querySelectorAll('blockquote')) {
    el.setAttribute('class', 'border-l-4 border-blue-500 pl-4 italic text-gray-500 my-6');
    const innerP = el.querySelector('p');
    if (innerP) {
      innerP.removeAttribute('class');
      innerP.removeAttribute('style');
    }
  }

  for (const el of doc.querySelectorAll('hr')) {
    el.setAttribute('class', 'border-t border-gray-200 my-8');
    el.removeAttribute('width');
  }

  for (const el of doc.querySelectorAll('table')) {
    el.setAttribute('class', 'w-full border-collapse mb-6 text-sm');
    el.removeAttribute('border');
    el.removeAttribute('style');
    el.removeAttribute('cellpadding');
    el.removeAttribute('cellspacing');
  }
  for (const el of doc.querySelectorAll('td, th')) {
    el.setAttribute('class', 'border border-gray-200 p-3 align-top');
    el.removeAttribute('style');
    el.removeAttribute('width');
  }

  for (const el of doc.querySelectorAll('b, strong')) {
    el.removeAttribute('style');
  }
  for (const el of doc.querySelectorAll('em, i')) {
    el.removeAttribute('style');
  }

  for (const el of doc.querySelectorAll('span')) {
    el.removeAttribute('style');
    if (el.innerHTML.trim() === '&nbsp;' || el.innerHTML.trim() === '') {
      if (!el.closest('h3')) {
        el.replaceWith('');
      }
    }
  }

  for (const el of doc.querySelectorAll('div')) {
    const cls = el.getAttribute('class') || '';
    if (cls.includes('book-gallery') || cls.includes('book-item') || cls.includes('book-caption')) {
      continue;
    }
    const clean = [];
    if (cls.includes('box-note')) clean.push('bg-gray-50 border border-gray-200 rounded-lg p-4 my-4');
    if (cls.includes('box-content')) clean.push('mb-6');
    if (cls.includes('et_pb_divider_internal')) clean.push('border-t border-gray-300 my-6');
    if (clean.length > 0) {
      el.setAttribute('class', clean.join(' '));
    } else if (cls && (cls.includes('et_pb_') || cls.includes('wp-') || cls.includes('ms-') || cls.includes('p-column') || cls.includes('size-full') || cls.includes('align'))) {
      el.removeAttribute('class');
    }
    el.removeAttribute('style');
    el.removeAttribute('data-columns');
  }

  for (const el of doc.querySelectorAll('audio')) {
    el.setAttribute('class', 'w-full my-4');
    el.removeAttribute('style');
  }

  for (const el of doc.querySelectorAll('iframe')) {
    el.setAttribute('class', 'w-full max-w-3xl rounded-lg my-4');
    el.removeAttribute('frameborder');
  }

  // Clean empty class attrs
  for (const el of doc.querySelectorAll('[class=""]')) {
    el.removeAttribute('class');
  }
}

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  if (!content.includes('set:html')) {
    console.log(`  SKIP (no set:html): ${filePath}`);
    return false;
  }

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    console.log(`  SKIP (no frontmatter): ${filePath}`);
    return false;
  }
  const frontmatter = fmMatch[1];

  // Find the set:html template literal - handle multi-line backtick content
  const startIdx = content.indexOf('set:html={`');
  if (startIdx === -1) {
    console.log(`  SKIP (no set:html found): ${filePath}`);
    return false;
  }

  // Find matching closing backtick
  const templateStart = startIdx + 'set:html={`'.length;
  let depth = 1;
  let endIdx = templateStart;
  while (endIdx < content.length && depth > 0) {
    if (content[endIdx] === '`' && content[endIdx - 1] !== '\\') {
      depth--;
      if (depth === 0) break;
    }
    if (content[endIdx] === '`') {
      // Opening backtick inside template - shouldn't happen but handle it
    }
    if (content[endIdx] === '$' && content[endIdx + 1] === '{') {
      // Template expression inside - skip
    }
    endIdx++;
  }

  if (depth !== 0) {
    console.log(`  SKIP (unclosed template): ${filePath}`);
    return false;
  }

  const rawHtml = content.substring(templateStart, endIdx);

  // Get content before set:html (between <Layout> and set:html div)
  const fullBefore = content.substring(0, startIdx);
  // Find <Layout> tag and extract content between it and set:html
  const layoutMatch = fullBefore.match(/<Layout[^>]*>\s*([\s\S]*)$/);
  let beforeContent = '';
  if (layoutMatch) {
    let bc = layoutMatch[1];
    // Remove any trailing <div from the set:html div opening
    bc = bc.replace(/\s*<div\s*$/, '').replace(/\s*<div\s+set:html\s*$/, '');
    bc = bc.trim();
    if (bc) beforeContent = bc;
  }

  // Get content after set:html closing div
  const afterStart = endIdx + 1; // after closing backtick
  const afterAll = content.substring(afterStart);
  // Find closing div and Layout
  const afterMatch = afterAll.match(/^([\s\S]*?)<\/Layout>/);
  let afterContent = '';
  if (afterMatch) {
    let ac = afterMatch[1];
    // Remove `} />` artifacts
    ac = ac.replace(/^\s*`?\}\s*\/?>\s*/, '');
    ac = ac.trim();
    if (ac) afterContent = ac;
  }

  const dom = new JSDOM(`<!DOCTYPE html><body>${rawHtml}</body>`);
  const body = dom.window.document.body;

  applyTailwindClasses(dom.window.document);

  let cleanedHtml = body.innerHTML;
  // Decode double-encoded entities but preserve intentional entities
  cleanedHtml = cleanedHtml.replace(/&amp;amp;/g, '&amp;');
  cleanedHtml = cleanedHtml.replace(/&amp;gt;/g, '&gt;');
  cleanedHtml = cleanedHtml.replace(/&amp;lt;/g, '&lt;');

  const importPath = filePath.replace('src/pages/', '').split('/').filter(Boolean);
  let depth_count = importPath.length;
  let layoutImport;
  if (depth_count <= 1) {
    layoutImport = "import Layout from '../layouts/Layout.astro';";
  } else if (depth_count <= 2) {
    layoutImport = "import Layout from '../../layouts/Layout.astro';";
  } else if (depth_count <= 3) {
    layoutImport = "import Layout from '../../../layouts/Layout.astro';";
  } else {
    layoutImport = "import Layout from '../../../../layouts/Layout.astro';";
  }

  const newContent = `---
${frontmatter}
---

<Layout title={title}>
${beforeContent ? beforeContent + '\n' : ''}
${cleanedHtml}
${afterContent ? '\n' + afterContent : ''}
</Layout>`;

  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`  OK: ${filePath}`);
  return true;
}

const files = walkDir(PAGES_DIR);
let count = 0;
for (const file of files) {
  if (convertFile(file)) count++;
}
console.log(`\nConverted ${count} of ${files.length} files.`);

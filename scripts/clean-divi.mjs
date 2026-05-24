import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const PAGES_DIR = 'src/pages';

function shouldSkip(filePath) {
  const basename = path.basename(filePath);
  if (basename === 'env.d.ts') return true;
  if (filePath.includes('/layouts/')) return true;
  if (filePath.includes('/noticias/')) return true;
  return false;
}

function preCleanHTML(html) {
  // MS Office garbage - both raw and HTML-entity encoded
  html = html.replace(/<!--\s*\[if gte mso[\s\S]*?<!\[endif\]-->/gi, '');
  html = html.replace(/<!--\s*&#091;if gte mso[\s\S]*?<!&#091;endif&#093;-->/gi, '');
  // Handle MS Office garbage split into <p> tags (WordPress entity-encoded)
  html = html.replace(/<p><!-- &#091;if gte mso \d+&#093;>[\s\S]*?<!\[endif\]--><\/p>/gi, '');
  html = html.replace(/<p><!-- &#091;if gte mso \d+&#093;>[\s\S]*?<!&#091;endif&#093;--><\/p>/gi, '');
  html = html.replace(/<p><w:WordDocument>[\s\S]*?<\/w:WordDocument><\/p>/gi, '');
  html = html.replace(/<p><w:LatentStyles[\s\S]*?<\/w:LatentStyles><\/p>/gi, '');
  html = html.replace(/<p><\/xml>\s*<!&#091;endif&#093;-->\s*<\/p>/gi, '');
  html = html.replace(/<style>\s*\/\* Style Definitions \*\/[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<p><!\[endif\]--><\/p>/g, '');
  html = html.replace(/<p><!&#091;endif&#093;--><\/p>/g, '');
  html = html.replace(/<p>[^<]*MsoNormal[^<]*<\/p>/gi, '');
  html = html.replace(/<p>[^<]*mso-[^<]*<\/p>/gi, '');
  // Remove duplicate audio tags with old WordPress domain
  html = html.replace(/<audio[^>]*src="https?:\/\/[^"]*manuelrojas\.cl\/wp-content\/uploads\/[^"]*"[^>]*><\/audio>/gi, '');
  // Remove empty paragraphs left after cleanup
  html = html.replace(/<p>\s*<\/p>/gi, '');
  return html;
}

function cleanImageAttrs(img) {
  img.removeAttribute('decoding');
  img.removeAttribute('fetchpriority');
  img.removeAttribute('loading');
  img.removeAttribute('srcset');
  img.removeAttribute('sizes');
  img.className = img.className.replace(/\bwp-image-\d+\b/g, '').trim();
  if (!img.className) img.removeAttribute('class');
}

function unwrapElement(el) {
  const parent = el.parentElement;
  if (!parent) return;
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }
  parent.removeChild(el);
}

function isEmptyElement(el) {
  const text = el.textContent.trim();
  const hasImages = el.querySelector('img');
  const hasIframes = el.querySelector('iframe');
  const hasAudio = el.querySelector('audio');
  return !text && !hasImages && !hasIframes && !hasAudio;
}

function hasValuableContent(el) {
  return el.querySelector('h1, h2, h3, h4, h5, h6, p, table, img, iframe, audio, hr, blockquote, ul, ol, form');
}

function cleanDiviHTML(html) {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`);
  const doc = dom.window.document;
  const body = doc.body;

  // --- STEP 1: Remove pure garbage ---
  doc.querySelectorAll('.box-shadow-overlay, .screen-reader-response, .akismet-fields-container').forEach(el => el.remove());

  // Remove hidden fields container from CF7 but keep the fields
  doc.querySelectorAll('.hidden-fields-container').forEach(el => {
    while (el.firstChild) {
      el.parentElement.insertBefore(el.firstChild, el);
    }
    el.remove();
  });

  // Remove Divi placeholder images (SVG data URIs)
  doc.querySelectorAll('img[src^="data:image/svg+xml"]').forEach(el => {
    const wrapper = el.closest('.et_pb_image');
    if (wrapper) wrapper.remove();
    else el.remove();
  });

  // Remove empty columns
  doc.querySelectorAll('.et_pb_column_empty').forEach(el => {
    if (!el.textContent.trim() && !el.querySelector('img, iframe, audio')) {
      el.remove();
    }
  });

  // Remove divider modules
  doc.querySelectorAll('.et_pb_divider').forEach(el => el.remove());

  // Remove empty blog modules
  doc.querySelectorAll('.et_pb_blog').forEach(el => el.remove());

  // Remove empty text modules
  doc.querySelectorAll('.et_pb_text').forEach(el => {
    if (isEmptyElement(el)) el.remove();
  });

  // --- STEP 2: Extract content from inner containers ---
  
  // Extract et_pb_text_inner -> replace parent module with its content
  doc.querySelectorAll('.et_pb_text_inner').forEach(el => {
    const moduleParent = el.closest('.et_pb_text');
    if (!moduleParent) return;
    while (el.firstChild) {
      moduleParent.parentElement.insertBefore(el.firstChild, moduleParent);
    }
    moduleParent.remove();
  });

  // Extract images from et_pb_image_wrap
  doc.querySelectorAll('.et_pb_image_wrap').forEach(el => {
    const innerLink = el.querySelector('a');
    const img = el.querySelector('img');
    const outerLink = el.parentElement?.tagName === 'A' ? el.parentElement : null;
    const moduleParent = el.closest('.et_pb_image');
    if (!moduleParent || !moduleParent.parentElement || !img) return;

    if (innerLink || outerLink) {
      const linkEl = innerLink || outerLink;
      const href = linkEl.getAttribute('href');
      const target = linkEl.getAttribute('target');
      cleanImageAttrs(img);
      const newLink = doc.createElement('a');
      newLink.setAttribute('href', href);
      if (target) newLink.setAttribute('target', target);
      newLink.appendChild(img.cloneNode(true));
      moduleParent.parentElement.insertBefore(newLink, moduleParent);
    } else {
      cleanImageAttrs(img);
      moduleParent.parentElement.insertBefore(img.cloneNode(true), moduleParent);
    }
    moduleParent.remove();
  });

  // Extract et_pb_code_inner
  doc.querySelectorAll('.et_pb_code_inner').forEach(el => {
    const moduleParent = el.closest('.et_pb_code');
    if (!moduleParent || !moduleParent.parentElement) return;
    while (el.firstChild) {
      moduleParent.parentElement.insertBefore(el.firstChild, moduleParent);
    }
    moduleParent.remove();
  });

  // Extract et_pb_cta / et_pb_promo
  doc.querySelectorAll('.et_pb_cta, .et_pb_promo').forEach(el => {
    if (!el.parentElement) return;
    const desc = el.querySelector('.et_pb_promo_description');
    if (desc) {
      while (desc.firstChild) {
        el.parentElement.insertBefore(desc.firstChild, el);
      }
    }
    el.remove();
  });

  // --- STEP 3: Flatten remaining Divi structural wrappers ---

  const STRUCTURAL_CLASSES = [
    'et_pb_section', 'et_pb_row', 'et_pb_column',
    'et_pb_with_border', 'et_pb_module',
    'et-l', 'et_builder_inner_content',
    'entry-content',
  ];

  const STRUCTURAL_TAGS = ['ARTICLE'];

  // Flatten in multiple passes (bottom-up via reverse querySelectorAll)
  let changed = true;
  while (changed) {
    changed = false;
    const allDivs = body.querySelectorAll('div');
    for (let i = allDivs.length - 1; i >= 0; i--) {
      const div = allDivs[i];
      const classes = div.className || '';
      const shouldFlatten = STRUCTURAL_CLASSES.some(c => classes.includes(c));
      if (shouldFlatten && div.parentElement && div !== body) {
        if (div.children.length === 0 && !div.textContent.trim()) {
          div.remove();
          changed = true;
          continue;
        }
        unwrapElement(div);
        changed = true;
      }
    }
  }

  // Flatten article wrappers
  body.querySelectorAll('article').forEach(el => {
    if (el.parentElement) unwrapElement(el);
  });

  // Flatten .content.clearfix double-wrappers
  body.querySelectorAll('.content.clearfix').forEach(el => {
    if (el.parentElement && hasValuableContent(el)) {
      unwrapElement(el);
    }
  });

  // Remove remaining wpcf7-response-output
  body.querySelectorAll('.wpcf7-response-output').forEach(el => {
    if (isEmptyElement(el)) el.remove();
  });

  // --- STEP 4: Clean up inline styles in breadcrumb spans ---
  body.querySelectorAll('span[style*="rgba(53, 53, 53"]').forEach(el => {
    const parent = el.parentElement;
    if (parent) {
      const breadcrumbText = el.textContent.trim();
      el.textContent = breadcrumbText;
      el.removeAttribute('style');
    }
  });

  // Remove &nbsp; at start of headings
  body.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
    let html = el.innerHTML;
    html = html.replace(/^&nbsp;\s*/, '');
    el.innerHTML = html;
  });

  // --- STEP 5: Clean WordPress image attributes ---
  body.querySelectorAll('img').forEach(img => {
    cleanImageAttrs(img);
  });

  // Clean wp-audio-shortcode class
  body.querySelectorAll('.wp-audio-shortcode').forEach(el => {
    el.classList.remove('wp-audio-shortcode');
    el.removeAttribute('id');
  });

  // Clean wpcf7 classes
  body.querySelectorAll('.wpcf7').forEach(el => {
    el.classList.remove('wpcf7', 'no-js');
    el.removeAttribute('id');
    el.removeAttribute('data-wpcf7-id');
  });
  body.querySelectorAll('.wpcf7-form').forEach(el => {
    el.className = '';
    el.removeAttribute('data-status');
    el.removeAttribute('aria-label');
  });
  body.querySelectorAll('.wpcf7-form-control').forEach(el => {
    el.className = '';
    el.removeAttribute('aria-required');
    el.removeAttribute('aria-invalid');
  });
  body.querySelectorAll('.wpcf7-form-control-wrap').forEach(el => {
    el.className = '';
  });
  body.querySelectorAll('.wpcf7-submit').forEach(el => {
    el.className = '';
  });
  body.querySelectorAll('.wpcf7-submit').forEach(el => {
    if (!el.className) el.removeAttribute('class');
  });

  // Clean old domain links
  body.querySelectorAll('a[href*="manuelrojas.cl/wp-content/uploads"]').forEach(el => {
    const href = el.getAttribute('href');
    const newHref = href.replace(/https?:\/\/[^\/]*manuelrojas\.cl\/wp-content\/uploads\//, '/media/');
    el.setAttribute('href', newHref);
  });

  // Remove form action with /index.php/ path
  body.querySelectorAll('form[action*="/index.php/"]').forEach(el => {
    const action = el.getAttribute('action');
    const newAction = action.replace(/\/index\.php/, '');
    el.setAttribute('action', newAction);
  });

  // --- STEP 6: Get clean HTML ---
  let result = body.innerHTML.trim();

  // Post-clean: remove excessive whitespace
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.replace(/>\s+</g, '><');
  
  // Fix common patterns
  result = result.replace(/(<h[1-6][^>]*>)\s*/g, '\n$1');
  result = result.replace(/\s*(<\/h[1-6]>)/g, '$1\n');

  return result.trim();
}

async function main() {
  const files = fs.globSync(`${PAGES_DIR}/**/*.astro`);
  let cleaned = 0;
  let skipped = 0;

  for (const filePath of files) {
    if (shouldSkip(filePath)) {
      skipped++;
      continue;
    }

    const relativePath = path.relative('.', filePath);
    let source = fs.readFileSync(filePath, 'utf-8');

    const fmMatch = source.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) {
      console.log(`  SKIP (no fm): ${relativePath}`);
      skipped++;
      continue;
    }
    const frontmatter = fmMatch[0];

    const setHtmlMatch = source.match(/set:html=\{`([\s\S]*?)`\}/);
    if (!setHtmlMatch) {
      console.log(`  SKIP (no set:html): ${relativePath}`);
      skipped++;
      continue;
    }

    let html = setHtmlMatch[1];
    html = preCleanHTML(html);

    let cleanHTML;
    try {
      cleanHTML = cleanDiviHTML(html);
    } catch (err) {
      console.log(`  ERROR parsing: ${relativePath} - ${err.message}`);
      continue;
    }

    // Reconstruct the .astro file
    const beforeSetHtml = source.substring(0, setHtmlMatch.index);
    const afterSetHtml = source.substring(setHtmlMatch.index + setHtmlMatch[0].length);

    const newContent = beforeSetHtml + `set:html={\`${cleanHTML}\`}` + afterSetHtml;
    fs.writeFileSync(filePath, newContent, 'utf-8');

    console.log(`  CLEANED: ${relativePath}`);
    cleaned++;
  }

  console.log(`\nDone: ${cleaned} cleaned, ${skipped} skipped`);
}

main().catch(console.error);

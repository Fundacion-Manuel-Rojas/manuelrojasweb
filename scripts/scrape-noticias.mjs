import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const MEDIA_DIR = path.join(ROOT, 'public', 'media');
const SITE = 'https://manuelrojas.cl';

const DOWNLOADED = new Set();
const ALL_IMAGES = new Set();

// All noticia URLs extracted from the archive page
const NOTICIA_URLS = [
  '/index.php/2010/11/11/manuel-rojas-nuevas-lecturas/',
  '/index.php/2011/06/07/homenaje-de-la-apech/',
  '/index.php/2011/09/06/exposicion-la-oscura-vida-radiante/',
  '/index.php/2012/03/25/cruce-centenario-de-la-cordillera/',
  '/index.php/2012/03/25/manuel-rojas-po-la-brigada-negotropica/',
  '/index.php/2012/08/25/manuel-rojas-vuelve-a-la-carcel-de-valparaiso/',
  '/index.php/2012/09/27/rubem-fonseca-gana-premio-manuel-rojas/',
  '/index.php/2013/01/11/antonio-avaria-entrevista-con-manuel-rojas/',
  '/index.php/2013/01/11/german-ewart-manuel-rojas/',
  '/index.php/2013/01/11/lenka-franulic-un-personaje-al-trasluz/',
  '/index.php/2013/01/19/poeticas-fronterizas/',
  '/index.php/2013/04/20/la-prosa-nunca-esta-terminada/',
  '/index.php/2013/08/13/cuando-se-espera-el-sueno/',
  '/index.php/2013/08/15/ricardo-piglia-gana-premio-manuel-rojas-2013/',
  '/index.php/2013/10/29/gonzalez-vera-reunido/',
  '/index.php/2013/12/04/piglia-compara-a-rojas-con-arlt/',
  '/index.php/2014/01/10/el-archivo-manuel-rojas/',
  '/index.php/2015/04/24/castellanos-moya-el-salvadoreno-errante/',
  '/index.php/2015/04/24/castellanos-moya-en-chile/',
  '/index.php/2015/04/24/con-sus-lectores/',
  '/index.php/2015/04/24/de-la-poesia-a-la-revolucion-ensayo/',
  '/index.php/2015/06/08/lanchas-en-la-bahia_noticia/',
  '/index.php/2015/07/19/la-banda-aniceto/',
  '/index.php/2015/09/27/de-la-poesia-a-la-revolucion_noticia/',
  '/index.php/2016/05/06/imagenes-de-infancia-ampliadas/',
  '/index.php/2016/05/21/obras-mayores/',
  '/index.php/2016/07/01/hijo-de-ladron-novela-grafica/',
  '/index.php/2016/09/09/una-oscura-y-radiante-vida/',
  '/index.php/2016/12/09/hijo-de-ladron-hambre-de-vida/',
  '/index.php/2019/10/17/de-que-se-nutre-la-esperanza/',
  '/index.php/2019/11/09/chile-no-suena-inutilmente/',
  '/index.php/2019/11/13/variedades-de-lumpen/',
  '/index.php/2019/11/25/nuestra-esperanza-solo-puede-venir-de-los-sin-esperanza/',
  '/index.php/2019/12/01/quienes-son-los-equivocados/',
  '/index.php/2019/12/20/prueba2/',
  '/index.php/2020/03/02/guion-bajo-publica-uno-de-los-cuentos-ineditos-de-rojas-noche-buena-en-santiago/',
  '/index.php/2020/05/18/the-glass-of-milk/',
  '/index.php/2020/07/12/angelita-jeria/',
];

function urlToFilePath(url) {
  let s = url.replace(/^\/index\.php\//, '').replace(/\/$/, '');
  return path.join(PAGES_DIR, `${s}.astro`);
}

async function fetchPage(url) {
  const fullUrl = url.startsWith('http') ? url : `${SITE}${url}`;
  console.log(`  Fetching: ${fullUrl}`);
  try {
    const res = await fetch(fullUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AstroMigrator/1.0)' },
      timeout: 30000,
    });
    if (!res.ok) {
      console.log(`    FAILED: ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (e) {
    console.log(`    FAILED: ${e.message}`);
    return null;
  }
}

function extractContent(html, url) {
  const dom = new JSDOM(html, { contentType: 'text/html' });
  const doc = dom.window.document;

  const titleEl = doc.querySelector('title');
  const title = titleEl?.textContent?.replace(/\s*\|\s*Fundación Manuel Rojas/, '').trim() || '';
  const isPost = url.includes('/20');

  let contentRoot = doc.querySelector('#main-content');
  if (!contentRoot) {
    contentRoot = doc.querySelector('.entry-content') || doc.querySelector('article');
  }
  if (!contentRoot) contentRoot = doc.body;

  const clone = contentRoot.cloneNode(true);

  // Remove unwanted elements
  const unwanted = clone.querySelectorAll(
    'script, style, link, nav, header, footer, ' +
    '.et_pb_scroll_top, .nav-single, .post-meta, ' +
    '.wp-video-shortcode, .mejs-container, ' +
    '.et_pb_section_0_tb_header, .et_pb_section_0_tb_footer, ' +
    '.sharedaddy, .et_social_networks'
  );
  unwanted.forEach(el => el.remove());

  let contentHtml = '';

  // For Theme Builder pages, find the actual post content
  const themeBuilder = clone.querySelector('.et-l--body');
  if (themeBuilder) {
    const postContent = themeBuilder.querySelector(
      '.et_pb_post_content_0_tb_body, ' +
      '.et_pb_post_content, ' +
      'article .entry-content, ' +
      '.et_pb_section > .et_pb_row > .et_pb_column > .et_pb_post_content'
    );

    if (postContent) {
      // Remove the outer et_pb_post_content wrapper divs
      // but keep the inner content
      let inner = postContent.innerHTML.trim();

      // Remove Divi section wrapper if it only contains a single content section
      // that wraps all the text. We want to keep the et_pb_text content but
      // strip excess Divi section/row/column wrappers around single text blocks.
      const sectionMatch = inner.match(
        /^<div class="et-l et-l--post">\s*<div class="et_builder_inner_content[^"]*">\s*<div class="et_pb_section[^"]*">\s*(.*?)\s*<\/div>\s*<\/div>\s*<\/div>$/s
      );
      if (sectionMatch) {
        inner = sectionMatch[1];
      }

      contentHtml = inner;
    } else {
      // No post content module found, try whole body
      contentHtml = clone.innerHTML.trim();
    }
  } else {
    contentHtml = clone.innerHTML.trim();
  }

  // Collect images
  const images = [];
  doc.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') || img.getAttribute('data-src');
    if (src && !src.includes('blank.gif') && !src.includes('preloader') && !src.startsWith('data:')) {
      let fullSrc = src;
      if (src.startsWith('//')) fullSrc = 'https:' + src;
      else if (src.startsWith('/')) fullSrc = SITE + src;
      else if (!src.startsWith('http')) fullSrc = SITE + '/' + src;
      images.push(fullSrc);
    }
  });

  return { title, contentHtml, images };
}

async function downloadMedia(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) return;
  if (DOWNLOADED.has(url)) return;
  DOWNLOADED.add(url);

  let urlObj;
  try { urlObj = new URL(url); } catch { return; }

  // Handle both manuelrojas.cl and www.manuelrojas.cl
  let mediaPath = urlObj.pathname.replace(/^\/wp-content\/uploads\//, '');
  if (url.includes('www.manuelrojas.cl')) {
    mediaPath = urlObj.pathname.replace('/wp-content/uploads/', '').replace(/^\//, '');
  }

  const dest = path.join(MEDIA_DIR, mediaPath);
  if (fs.existsSync(dest)) return;

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 30000,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    console.log(`    Downloaded: ${mediaPath}`);
  } catch (e) {
    console.log(`    Failed img: ${url} - ${e.message}`);
  }
}

function relativeLayoutPath(filePath) {
  const rel = path.relative(path.dirname(filePath), path.join(PAGES_DIR, '..', 'layouts'));
  return (rel.startsWith('.') ? rel : './' + rel).replace(/\\/g, '/') + '/Layout.astro';
}

function generateAstroPage(title, contentHtml, url, filePath) {
  const layoutPath = relativeLayoutPath(filePath);

  // Rewrite image URLs to local paths (handle multiple domain variants)
  let body = contentHtml
    .replace(/https?:\/\/manuelrojas\.cl\/wp-content\/uploads\//g, '/media/')
    .replace(/https?:\/\/www\.manuelrojas\.cl\/wp-content\/uploads\//g, '/media/')
    .replace(/http:\/\/www\.manuelrojas\.cl\/wp-content\/uploads\//g, '/media/');

  // Rewrite internal links (handle both manuelrojas.cl and www.manuelrojas.cl, http and https)
  body = body
    .replace(/href="https?:\/\/manuelrojas\.cl\/index\.php\//g, 'href="/')
    .replace(/href="https?:\/\/manuelrojas\.cl\//g, 'href="/')
    .replace(/href="https?:\/\/www\.manuelrojas\.cl\/index\.php\//g, 'href="/')
    .replace(/href="https?:\/\/www\.manuelrojas\.cl\//g, 'href="/');

  // Add Tailwind classes to images that don't have them
  body = body.replace(
    /<img((?:(?!class=)[^>])*)>/g,
    (match, attrs) => {
      if (match.includes('class=')) return match;
      return `<img${attrs} class="rounded-lg border border-gray-300 shadow-sm max-w-full h-auto my-4 mx-auto block">`;
    }
  );

  // Extract date from URL
  const dateMatch = url.match(/\/20(\d{2})\/(\d{2})\/(\d{2})\//);
  const dateHtml = dateMatch
    ? `<p class="text-sm text-gray-400 mb-6">${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}</p>`
    : '';

  const escapedBody = body.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

  return `---
import Layout from '${layoutPath}';
const title = ${JSON.stringify(title)};
---

<Layout title={title}>

<h1 class="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
${dateHtml}
<div set:html={\`${escapedBody}\`} />
</Layout>
`;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

async function main() {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });

  const allNoticias = [];

  for (const url of NOTICIA_URLS) {
    console.log(`\nProcessing: ${url}`);
    const html = await fetchPage(url);
    if (!html) continue;

    const { title, contentHtml, images } = extractContent(html, url);
    if (!title && !contentHtml) {
      console.log('  No content found');
      continue;
    }

    console.log(`  Title: ${title}`);
    console.log(`  Content: ${contentHtml.length} chars, ${images.length} images`);

    images.forEach(img => ALL_IMAGES.add(img));

    const filePath = urlToFilePath(url);
    ensureDir(filePath);

    const astroContent = generateAstroPage(title, contentHtml, url, filePath);
    fs.writeFileSync(filePath, astroContent);
    console.log(`  Saved: ${path.relative(ROOT, filePath)}`);

    // Extract date info for listing
    const dateMatch = url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
    allNoticias.push({
      title,
      url: url.replace(/^\/index\.php/, ''),
      date: dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '',
      year: dateMatch ? dateMatch[1] : '',
    });
  }

  // Download all images
  console.log(`\n=== Downloading ${ALL_IMAGES.size} unique images ===`);
  const urls = [...ALL_IMAGES];
  for (const imgUrl of urls) {
    await downloadMedia(imgUrl);
  }

  // Generate noticias listing page
  console.log('\n=== Generating noticias listing page ===');
  allNoticias.sort((a, b) => b.date.localeCompare(a.date));

  let listingHtml = '<h3 class="text-2xl font-semibold text-gray-700 mb-3">Noticias</h3>\n';
  listingHtml += '<div class="space-y-8">\n';

  for (const n of allNoticias) {
    listingHtml += `<div class="border-b border-gray-200 pb-6">
  <p class="text-sm text-gray-400 mb-1">${n.date}</p>
  <h2 class="text-xl font-bold text-gray-800 mb-2">
    <a href="${n.url}" class="text-blue-500 hover:underline">${n.title}</a>
  </h2>
</div>\n`;
  }

  listingHtml += '</div>\n';

  const noticiasPageContent = `---
import Layout from '../layouts/Layout.astro';
const title = "Noticias";
---

<Layout title={title}>

${listingHtml}
</Layout>
`;

  const noticiasPath = path.join(PAGES_DIR, 'noticias.astro');
  fs.writeFileSync(noticiasPath, noticiasPageContent);
  console.log(`  Saved: ${path.relative(ROOT, noticiasPath)}`);

  console.log('\n=== Complete ===');
  console.log(`Total noticias: ${allNoticias.length}`);
}

main().catch(console.error);

import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const MEDIA_DIR = path.join(ROOT, 'public', 'media');
const DOWNLOADED = new Set();
const MEDIA_URLS = new Set();

const SITE = 'https://manuelrojas.cl';

const URLS = [
  '/',
  '/index.php/quienes-somos/',
  '/index.php/quienes-somos/fundacion/',
  '/index.php/quienes-somos/integrantes/',
  '/index.php/quienes-somos/actividades/',
  '/index.php/manuel-rojas/',
  '/index.php/manuel-rojas/vida/biografia/',
  '/index.php/manuel-rojas/vida/cronologia/',
  '/index.php/manuel-rojas/obra/poesia/',
  // Poesia sub-pages
  '/index.php/canciones-para-ellos/',
  '/index.php/deshecha-rosa/',
  '/index.php/poeticas/',
  '/index.php/tonada-del-transeunte/',
  '/index.php/obras_libro/cuentos-libro/',
  // Cuentos sub-pages
  '/index.php/10914-2/',
  '/index.php/cuentos-completos/',
  '/index.php/el-bonete-maulino/',
  '/index.php/el-delincuente/',
  '/index.php/el-hombre-de-la-rosa/',
  '/index.php/el-vaso-de-leche/',
  '/index.php/hombres-del-sur/',
  '/index.php/travesia/',
  '/index.php/novelas/',
  // Novelas sub-pages
  '/index.php/hijo-de-ladron/',
  '/index.php/la-ciudad-de-los-cesares/',
  '/index.php/lanchas-en-la-bahia/',
  '/index.php/la-oscura-vida-radiante/',
  '/index.php/mejor-que-el-vino/',
  '/index.php/punta-de-rieles/',
  '/index.php/sombras-contra-el-muro/',
  '/index.php/tiempo-irremediable/',
  '/index.php/ensayos-2/',
  '/index.php/manuel-rojas/obra/autobiografias_viajes/',
  '/index.php/compilaciones/',
  '/index.php/manuel-rojas/galeria/fotografias/',
  '/index.php/10035-2/',
  '/index.php/manuel-rojas/galeria/audios/',
  '/index.php/sobre-su-obra/videos_y_audios/',
  '/index.php/sobre-su-obra/publicaciones_estudios/',
  '/index.php/sobre-su-obra/premios/',
  '/index.php/sobre-su-obra/exposiciones/',
  '/index.php/noticias/',
  '/index.php/contacto/',
  '/index.php/derechos-de-autor/',
  // Blog posts
  '/index.php/2016/12/09/hijo-de-ladron-hambre-de-vida/',
  '/index.php/2019/10/17/de-que-se-nutre-la-esperanza/',
  '/index.php/2019/11/09/chile-no-suena-inutilmente/',
  '/index.php/2019/11/13/variedades-de-lumpen/',
  '/index.php/2019/11/25/nuestra-esperanza-solo-puede-venir-de-los-sin-esperanza/',
  '/index.php/2019/12/01/quienes-son-los-equivocados/',
  '/index.php/2019/12/20/prueba2/',
  '/index.php/2020/07/12/angelita-jeria/',
  '/index.php/2020/05/18/the-glass-of-milk/',
  '/index.php/2020/03/02/guion-bajo-publica-uno-de-los-cuentos-ineditos-de-rojas-noche-buena-en-santiago/',
  '/index.php/ensayos-i-el-arbol-siempre-verde/',
  '/index.php/ensayos-completos-i/',
  '/index.php/mariano-latorre-algunos-de-sus-mejores-cuentos/',
  '/index.php/el-arbol-siempre-verde/',
  '/index.php/chile-5-navegantes-y-1-astronomo/',
  '/index.php/jose-joaquin-vallejo/',
  '/index.php/los-costumbristas-chilenos/',
  '/index.php/alberto-edwards-cuentos-fantasticos/',
  '/index.php/blest-gana-sus-mejores-paginas/',
  '/index.php/esencias-del-pais-chileno-poesias/',
  '/index.php/apuntes-sobre-la-expresion-escrita/',
  '/index.php/historia-breve-de-la-literatura-chilena/',
  '/index.php/2015/04/24/de-la-poesia-a-la-revolucion-ensayo/',
];

function urlToFilePath(url) {
  if (url === '/') return path.join(PAGES_DIR, 'index.astro');
  let s = url.replace(/^\/index\.php\//, '').replace(/\/$/, '');
  if (!s) return path.join(PAGES_DIR, 'index.astro');
  return path.join(PAGES_DIR, `${s}.astro`);
}

async function fetchPage(url) {
  const fullUrl = url.startsWith('http') ? url : `${SITE}${url}`;
  console.log(`  Fetching: ${fullUrl}`);
  const res = await fetch(fullUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AstroMigrator/1.0)' },
    timeout: 30000,
  });
  if (!res.ok) {
    console.log(`    FAILED: ${res.status}`);
    return null;
  }
  return await res.text();
}

function transformTablesToGalleries(html) {
  return html.replace(/<table[^>]*class="[^"]*responsive-table[^"]*"[^>]*>[\s\S]*?<\/table>/gi, (match) => {
    const items = [];
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let tdMatch;
    while ((tdMatch = tdRegex.exec(match)) !== null) {
      const tdContent = tdMatch[1].trim();
      if (tdContent) {
        // Extract link, image, and caption from td
        const linkMatch = tdContent.match(/<a\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
        const imgMatch = tdContent.match(/<img[^>]*src="([^"]*)"[^>]*>/i);
        const caption = tdContent
          .replace(/<a[^>]*>[\s\S]*?<\/a>/gi, '')
          .replace(/<p[^>]*>/gi, '')
          .replace(/<\/p>/gi, '')
          .replace(/<br\s*\/?>/gi, '')
          .trim();

        let itemHtml = '';
        if (linkMatch && imgMatch) {
          itemHtml = `<a href="${linkMatch[1]}">${imgMatch[0]}</a>`;
        } else if (imgMatch) {
          itemHtml = imgMatch[0];
        }
        if (caption) {
          itemHtml += `<span class="book-caption">${caption}</span>`;
        }
        if (itemHtml) {
          items.push(`<div class="book-item">${itemHtml}</div>`);
        }
      }
    }
    if (items.length === 0) return match;
    return `<div class="book-gallery">${items.join('\n')}</div>`;
  });
}

function extractContent(html, url) {
  const dom = new JSDOM(html, { contentType: 'text/html' });
  const doc = dom.window.document;

  const title = doc.querySelector('title')?.textContent?.replace(' | Fundación Manuel Rojas', '').trim() || '';
  const isPost = url.includes('/20');

  // Get #main-content first (for Theme Builder pages)
  let contentRoot = doc.querySelector('#main-content');

  // For non-Theme-Builder pages, try entry-content
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
    '.et_pb_section_0_tb_header, .et_pb_section_0_tb_footer'
  );
  unwanted.forEach(el => el.remove());

  // For Theme Builder pages (has .et-l--body), try to find actual page content
  const themeBuilder = clone.querySelector('.et-l--body');
  let contentHtml = '';

  if (themeBuilder) {
    // Look for post content module (actual page content rendered by Theme Builder)
    const postContent = themeBuilder.querySelector(
      '.et_pb_post_content_0_tb_body, ' +
      '.et_pb_post_content, ' +
      'article .entry-content, ' +
      '.et_pb_section > .et_pb_row > .et_pb_column > .et_pb_post_content'
    );

    if (postContent) {
      contentHtml = postContent.innerHTML.trim();
    } else {
      // No post content module - use the whole theme builder section
      // But remove blog grid/posts modules for non-archive pages
      const isArchive = url.includes('/noticias/') || url.includes('/20');
      if (!isArchive) {
        const blogModules = clone.querySelectorAll('.et_pb_blog_grid, .et_pb_posts, .et_pb_ajax_pagination_container');
        blogModules.forEach(el => el.remove());
      }
      contentHtml = clone.innerHTML.trim();
    }
  } else {
    // Non-Theme-Builder page - use the full content
    contentHtml = clone.innerHTML.trim();
  }

  // Transform book tables into galleries
  contentHtml = transformTablesToGalleries(contentHtml);

  // Collect images from the entire page (including header/footer)
  const images = [];
  doc.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') || img.getAttribute('data-src');
    if (src && !src.includes('blank.gif') && !src.includes('preloader') && !src.startsWith('data:')) {
      images.push(src.startsWith('http') ? src : `${SITE}${src}`);
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
  const mediaPath = urlObj.pathname.replace('/wp-content/uploads/', '');
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
    console.log(`    Failed: ${url} - ${e.message}`);
  }
}

function relativeLayoutPath(filePath) {
  const rel = path.relative(path.dirname(filePath), path.join(PAGES_DIR, '..', 'layouts'));
  return (rel.startsWith('.') ? rel : './' + rel).replace(/\\/g, '/') + '/Layout.astro';
}

function generateAstroPage(title, contentHtml, pageUrl, filePath) {
  const relPath = pageUrl === '/' ? '/' : pageUrl.replace(/^\/index\.php/, '').replace(/\/$/, '') + '/';
  const isPost = pageUrl.includes('/20');
  const layoutPath = relativeLayoutPath(filePath);

  // Rewrite image URLs to local paths
  const body = contentHtml.replace(
    /https?:\/\/manuelrojas\.cl\/wp-content\/uploads\//g,
    '/media/'
  );

  // Rewrite internal links
  const linkedBody = body.replace(
    /href="https?:\/\/manuelrojas\.cl\/index\.php\//g,
    'href="/'
  ).replace(
    /href="https?:\/\/manuelrojas\.cl\//g,
    'href="/'
  );

  let dateHtml = '';
  if (isPost) {
    const match = pageUrl.match(/\/20(\d{2})\/(\d{2})\/(\d{2})\//);
    if (match) {
      dateHtml = `<p class="post-date">${match[1]}/${match[2]}/${match[3]}</p>\n`;
    }
  }

  return `---
import Layout from '${layoutPath}';
const title = ${JSON.stringify(title)};
---

<Layout title={title}>
  ${dateHtml}
  <div set:html={\`${escapeHtml(linkedBody)}\`} />
</Layout>
`;
}

function escapeHtml(str) {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

async function main() {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });

  // Clean existing pages except layout and config
  const keep = ['layouts', 'env.d.ts', 'content.config.ts'];
  if (fs.existsSync(PAGES_DIR)) {
    for (const entry of fs.readdirSync(PAGES_DIR)) {
      if (!keep.includes(entry)) {
        rmRecursive(path.join(PAGES_DIR, entry));
      }
    }
  }

  for (const url of URLS) {
    console.log(`\nProcessing: ${url}`);
    const html = await fetchPage(url);
    if (!html) continue;

    const { title, contentHtml, images } = extractContent(html, url);
    if (!title && !contentHtml) {
      console.log('  No content found');
      continue;
    }

    images.forEach(img => MEDIA_URLS.add(img));

    const filePath = urlToFilePath(url);
    ensureDir(filePath);

    const astroContent = generateAstroPage(title, contentHtml, url, filePath);
    fs.writeFileSync(filePath, astroContent);
    console.log(`  Saved: ${filePath}`);
  }

  console.log(`\n=== Downloading ${MEDIA_URLS.size} unique images ===`);
  const urls = [...MEDIA_URLS];
  for (let i = 0; i < urls.length; i++) {
    await downloadMedia(urls[i]);
  }

  console.log('\n=== Complete ===');
}

function rmRecursive(dir) {
  if (fs.statSync(dir).isDirectory()) {
    for (const entry of fs.readdirSync(dir)) {
      rmRecursive(path.join(dir, entry));
    }
    fs.rmdirSync(dir);
  } else {
    fs.unlinkSync(dir);
  }
}

main().catch(console.error);

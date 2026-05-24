import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

const SITE = 'https://manuelrojas.cl';

async function analyze(url) {
  const fullUrl = url.startsWith('http') ? url : `${SITE}${url}`;
  console.log(`\n=== ${fullUrl} ===`);
  const res = await fetch(fullUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const dom = new JSDOM(html, { contentType: 'text/html' });
  const doc = dom.window.document;

  const title = doc.querySelector('title')?.textContent || 'no title';
  console.log(`Title: ${title}`);

  // Check which content areas exist
  const checks = [
    '#main-content',
    '.et_pb_post_content_0_tb_body',
    '.entry-content',
    'article',
    '.et_pb_section_0_tb_body',
    '.et-l--body',
  ];

  for (const sel of checks) {
    const el = doc.querySelector(sel);
    if (el) {
      const textLen = el.textContent.trim().length;
      const htmlLen = el.innerHTML.length;
      console.log(`  ${sel}: text=${textLen}B html=${htmlLen}B`);
    } else {
      console.log(`  ${sel}: NOT FOUND`);
    }
  }

  // Show the post content area if it exists
  const postContent = doc.querySelector('.et_pb_post_content_0_tb_body');
  if (postContent) {
    const text = postContent.textContent.trim().substring(0, 200);
    console.log(`  POST CONTENT preview: ${text}...`);
  }

  // Check if there's a blog module showing posts
  const blogModules = doc.querySelectorAll('.et_pb_blog_grid, .et_pb_posts');
  console.log(`  Blog modules found: ${blogModules.length}`);

  // Show first 500 chars of #main-content
  const mc = doc.querySelector('#main-content');
  if (mc) {
    const txt = mc.textContent.trim().substring(0, 300);
    console.log(`  MAIN-CONTENT preview: ${txt}...`);
  }
}

const urls = [
  '/index.php/quienes-somos/',
  '/index.php/ensayos-2/',
  '/index.php/manuel-rojas/',
  '/index.php/contacto/',
  '/index.php/2020/07/12/angelita-jeria/',
];

for (const url of urls) {
  await analyze(url);
}

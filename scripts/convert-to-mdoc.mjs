import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'noticias');

const NOTICIAS_INFO = [
  { slug: 'manuel-rojas-nuevas-lecturas', year: '2010', month: '11', day: '11' },
  { slug: 'homenaje-de-la-apech', year: '2011', month: '06', day: '07' },
  { slug: 'exposicion-la-oscura-vida-radiante', year: '2011', month: '09', day: '06' },
  { slug: 'cruce-centenario-de-la-cordillera', year: '2012', month: '03', day: '25' },
  { slug: 'manuel-rojas-po-la-brigada-negotropica', year: '2012', month: '03', day: '25' },
  { slug: 'manuel-rojas-vuelve-a-la-carcel-de-valparaiso', year: '2012', month: '08', day: '25' },
  { slug: 'rubem-fonseca-gana-premio-manuel-rojas', year: '2012', month: '09', day: '27' },
  { slug: 'antonio-avaria-entrevista-con-manuel-rojas', year: '2013', month: '01', day: '11' },
  { slug: 'german-ewart-manuel-rojas', year: '2013', month: '01', day: '11' },
  { slug: 'lenka-franulic-un-personaje-al-trasluz', year: '2013', month: '01', day: '11' },
  { slug: 'poeticas-fronterizas', year: '2013', month: '01', day: '19' },
  { slug: 'la-prosa-nunca-esta-terminada', year: '2013', month: '04', day: '20' },
  { slug: 'cuando-se-espera-el-sueno', year: '2013', month: '08', day: '13' },
  { slug: 'ricardo-piglia-gana-premio-manuel-rojas-2013', year: '2013', month: '08', day: '15' },
  { slug: 'gonzalez-vera-reunido', year: '2013', month: '10', day: '29' },
  { slug: 'piglia-compara-a-rojas-con-arlt', year: '2013', month: '12', day: '04' },
  { slug: 'el-archivo-manuel-rojas', year: '2014', month: '01', day: '10' },
  { slug: 'castellanos-moya-el-salvadoreno-errante', year: '2015', month: '04', day: '24' },
  { slug: 'castellanos-moya-en-chile', year: '2015', month: '04', day: '24' },
  { slug: 'con-sus-lectores', year: '2015', month: '04', day: '24' },
  { slug: 'de-la-poesia-a-la-revolucion-ensayo', year: '2015', month: '04', day: '24' },
  { slug: 'lanchas-en-la-bahia_noticia', year: '2015', month: '06', day: '08' },
  { slug: 'la-banda-aniceto', year: '2015', month: '07', day: '19' },
  { slug: 'de-la-poesia-a-la-revolucion_noticia', year: '2015', month: '09', day: '27' },
  { slug: 'imagenes-de-infancia-ampliadas', year: '2016', month: '05', day: '06' },
  { slug: 'obras-mayores', year: '2016', month: '05', day: '21' },
  { slug: 'hijo-de-ladron-novela-grafica', year: '2016', month: '07', day: '01' },
  { slug: 'una-oscura-y-radiante-vida', year: '2016', month: '09', day: '09' },
  { slug: 'hijo-de-ladron-hambre-de-vida', year: '2016', month: '12', day: '09' },
  { slug: 'de-que-se-nutre-la-esperanza', year: '2019', month: '10', day: '17' },
  { slug: 'chile-no-suena-inutilmente', year: '2019', month: '11', day: '09' },
  { slug: 'variedades-de-lumpen', year: '2019', month: '11', day: '13' },
  { slug: 'nuestra-esperanza-solo-puede-venir-de-los-sin-esperanza', year: '2019', month: '11', day: '25' },
  { slug: 'quienes-son-los-equivocados', year: '2019', month: '12', day: '01' },
  { slug: 'prueba2', year: '2019', month: '12', day: '20' },
  { slug: 'guion-bajo-publica-uno-de-los-cuentos-ineditos-de-rojas-noche-buena-en-santiago', year: '2020', month: '03', day: '02' },
  { slug: 'the-glass-of-milk', year: '2020', month: '05', day: '18' },
  { slug: 'angelita-jeria', year: '2020', month: '07', day: '12' },
];

function unescapeTemplateLiteral(str) {
  // Unescape backtick template literal content
  return str
    .replace(/\\\\/g, '\\')   // \\ -> \
    .replace(/\\`/g, '`')     // \` -> `
    .replace(/\\\$/g, '$')    // \$ -> $
    .replace(/\\r/g, '\r')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');
}

function extractSetHtml(astroContent) {
  // Find the set:html={`...`} directive
  const match = astroContent.match(/set:html=\{\`([\s\S]*?)\`\}/);
  if (!match) return '';
  return unescapeTemplateLiteral(match[1]);
}

function extractTitle(astroContent) {
  const match = astroContent.match(/const title = ["'](.+?)["']/);
  return match ? match[1] : '';
}

function cleanContent(html) {
  let cleaned = html;

  // Extract inner content from Divi et_pb_text_inner if present
  const innerMatch = cleaned.match(/class="[^"]*et_pb_text_inner[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/);
  if (innerMatch) {
    cleaned = innerMatch[1].trim();
  } else {
    // Try broader match for nested Divi structure
    const broadMatch = cleaned.match(/et_pb_text_inner[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (broadMatch) {
      cleaned = broadMatch[1].trim();
    }
  }

  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleaned = cleaned.replace(/\t/g, '  ');

  // Remove empty paragraphs
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/g, '');
  cleaned = cleaned.replace(/<p[^>]*>&nbsp;<\/p>/g, '');

  return cleaned.trim();
}

function generateMdoc(info, title, content) {
  const { year, month, day, slug } = info;
  const fecha = `${year}-${month}-${day}`;
  const categories = ['noticias'];

  // Determine category based on content/era
  const y = parseInt(year);
  if (y <= 2015) categories.push('anos-anteriores');

  // Escape YAML special chars in content if needed
  // For multiline content, use | block scalar
  let contentBlock;
  if (content.includes('\n')) {
    // Use literal block scalar
    contentBlock = '|\n  ' + content.replace(/\n/g, '\n  ');
  } else {
    contentBlock = content;
  }

  function yamlValue(val) {
    // Quote strings that contain colons followed by space, or start with special chars
    if (/:\s/.test(val) || /^[{}\[\]&*!|>%#@`,"']/.test(val) || val === 'true' || val === 'false' || val === 'null' || val === '') {
      return JSON.stringify(val);
    }
    return val;
  }

  const frontmatter = [
    '---',
    `title: ${slug}`,
    `subtitle: ${yamlValue(title)}`,
    `fecha: '${fecha}'`,
    `categoria: ${categories[0]}`,
    '---',
  ].join('\n');

  return frontmatter + '\n\n' + content + '\n';
}

async function main() {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });

  for (const info of NOTICIAS_INFO) {
    const filePath = path.join(PAGES_DIR, info.year, info.month, info.day, `${info.slug}.astro`);

    if (!fs.existsSync(filePath)) {
      console.log(`SKIPPED (not found): ${info.slug}`);
      continue;
    }

    const astroContent = fs.readFileSync(filePath, 'utf-8');
    const title = extractTitle(astroContent);
    const rawHtml = extractSetHtml(astroContent);
    const cleaned = cleanContent(rawHtml);

    if (!cleaned) {
      console.log(`SKIPPED (no content): ${info.slug}`);
      continue;
    }

    const mdoc = generateMdoc(info, title, cleaned);
    const mdocPath = path.join(CONTENT_DIR, `${info.slug}.mdoc`);
    fs.writeFileSync(mdocPath, mdoc);

    console.log(`OK: ${info.slug}.mdoc (${cleaned.length} chars)`);
  }

  console.log(`\nDone! ${NOTICIAS_INFO.length} noticias processed`);
}

main().catch(console.error);

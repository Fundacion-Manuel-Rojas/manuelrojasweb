import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE_URL = 'https://manuelrojas.cl';

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function toUrl(path: string): string {
  const clean = path.replace(/\/+$/, '') || '/';
  return `${SITE_URL}${clean === '/' ? '' : clean}/`;
}

function isoDate(value: string | Date | undefined | null): string | undefined {
  if (!value) return undefined;
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().split('T')[0];
  } catch {
    return undefined;
  }
}

export const GET: APIRoute = async () => {
  const noticias = await getCollection('noticias');
  const libros = await getCollection('libros');

  const staticPages: UrlEntry[] = [
    { loc: '/', changefreq: 'weekly', priority: 1.0 },
    { loc: '/quienes-somos/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/quienes-somos/fundacion/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/quienes-somos/integrantes/', changefreq: 'monthly', priority: 0.5 },
    { loc: '/quienes-somos/actividades/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/manuel-rojas/', changefreq: 'monthly', priority: 0.9 },
    { loc: '/manuel-rojas/vida/biografia/', changefreq: 'monthly', priority: 0.9 },
    { loc: '/manuel-rojas/vida/cronologia/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/manuel-rojas/galeria/fotografias/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/manuel-rojas/galeria/audios/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/sobre-su-obra/premios/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/sobre-su-obra/publicaciones_estudios/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/sobre-su-obra/exposiciones/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/sobre-su-obra/videos_y_audios/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/noticias/', changefreq: 'daily', priority: 0.8 },
    { loc: '/contacto/', changefreq: 'yearly', priority: 0.4 },
    { loc: '/derechos-de-autor/', changefreq: 'yearly', priority: 0.3 },
    { loc: '/poeticas/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/novelas/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/cuentos-completos/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/compilaciones/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/obras/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/obras-completas/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/hijo-de-ladron/', changefreq: 'monthly', priority: 0.8 },
    { loc: '/lanchas-en-la-bahia/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/punta-de-rieles/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/la-oscura-vida-radiante/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/sombras-contra-el-muro/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/tiempo-irremediable/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/mejor-que-el-vino/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/tonada-del-transeunte/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/travesia/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/deshecha-rosa/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/el-vaso-de-leche/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/el-delincuente/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/el-hombre-de-la-rosa/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/el-bonete-maulino/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/canciones-para-ellos/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/hombres-del-sur/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/la-ciudad-de-los-cesares/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/ensayos-completos-i/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/ensayos-2/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/ensayos-i-el-arbol-siempre-verde/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/el-arbol-siempre-verde/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/historia-breve-de-la-literatura-chilena/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/apuntes-sobre-la-expresion-escrita/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/de-la-poesia-a-la-revolucion-ensayo/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/esencias-del-pais-chileno-poesias/', changefreq: 'monthly', priority: 0.7 },
    { loc: '/jose-joaquin-vallejo/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/los-costumbristas-chilenos/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/blest-gana-sus-mejores-paginas/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/mariano-latorre-algunos-de-sus-mejores-cuentos/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/alberto-edwards-cuentos-fantasticos/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/chile-5-navegantes-y-1-astronomo/', changefreq: 'monthly', priority: 0.6 },
    { loc: '/obras_libro/cuentos-libro/', changefreq: 'monthly', priority: 0.6 },
  ];

  const noticiaEntries: UrlEntry[] = noticias.map((n) => ({
    loc: `/noticias/${n.id}/`,
    lastmod: isoDate(n.data.fecha),
    changefreq: 'monthly',
    priority: 0.6,
  }));

  const libroEntries: UrlEntry[] = libros.map((l) => ({
    loc: `/libros/${l.id}/`,
    changefreq: 'monthly',
    priority: 0.6,
  }));

  const all = [...staticPages, ...noticiaEntries, ...libroEntries];

  const seen = new Set<string>();
  const unique = all.filter((e) => {
    const key = e.loc;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique
  .map((e) => {
    const parts = [`  <loc>${toUrl(e.loc)}</loc>`];
    if (e.lastmod) parts.push(`    <lastmod>${e.lastmod}</lastmod>`);
    if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
    if (e.priority !== undefined) parts.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
    return '  <url>\n    ' + parts.join('\n    ') + '\n  </url>';
  })
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

import { defineCollection, type Loader } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const noticias = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/noticias' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    fecha: z.string().or(z.date().transform(d => d.toISOString().split('T')[0])),
    autor: z.string().optional(),
    categoria: z.enum(['noticias', 'entrevistas', 'anos-anteriores']).optional(),
    imagen: z.string().optional(),
    extracto: z.string().optional(),
    destacado: z.boolean().optional(),
  }),
});

const ROOT = join(process.cwd(), 'src/content/slider');

function parseFrontmatter(raw: string): Record<string, any> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const out: Record<string, any> = {};
  const lines = match[1].split(/\r?\n/);
  let currentKey: string | null = null;
  let currentBlock: string[] = [];
  for (const line of lines) {
    if (currentKey && /^\s/.test(line) && line.trim() !== '') {
      currentBlock.push(line.replace(/^ {2}/, ''));
      continue;
    }
    if (currentKey) {
      out[currentKey] = parseYamlValue(currentKey, currentBlock.join('\n'));
      currentKey = null;
      currentBlock = [];
    }
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (m) {
      currentKey = m[1];
      const rest = m[2];
      if (rest === '' || rest === '>' || rest === '|-' || rest === '>-' || rest === '|' || rest === '>-') {
        currentBlock = [];
      } else {
        currentKey = null;
        out[m[1]] = parseYamlValue(m[1], rest);
      }
    }
  }
  if (currentKey) out[currentKey] = parseYamlValue(currentKey, currentBlock.join('\n'));
  return out;
}

function parseYamlValue(_key: string, value: string): any {
  if (value === undefined) return undefined;
  const v = value.trim();
  if (v === '') return '';
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v.replace(/\s+/g, ' ').trim();
}

function sliderLoader(): Loader {
  return {
    name: 'slider-loader',
    async load(context) {
      const entries = await readdir(ROOT, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.mdoc')) continue;
        const slug = entry.name.replace(/\.mdoc$/, '');
        const mdocPath = join(ROOT, entry.name);
        const raw = await readFile(mdocPath, 'utf-8');
        const data = parseFrontmatter(raw);

        const dirPath = join(ROOT, slug);
        try {
          const dirStat = await stat(dirPath);
          if (dirStat.isDirectory()) {
            const mdxPath = join(dirPath, 'texto.mdx');
            try {
              const mdxRaw = await readFile(mdxPath, 'utf-8');
              data.texto = mdxRaw.trim();
            } catch {}
          }
        } catch {}

        context.store.set({
          id: slug,
          data,
        });
      }
    },
  };
}

const slider = defineCollection({
  loader: sliderLoader(),
  schema: z.object({
    title: z.string(),
    imagen: z.string(),
    alt: z.string().optional(),
    texto: z.string().optional(),
    enlace: z.string().optional(),
    orden: z.number().optional(),
  }),
});

const libros = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/libros' }),
  schema: z.object({
    titulo: z.string(),
    categoria: z.enum(['poesia', 'novela', 'cuento', 'ensayo', 'autobiografia_viaje', 'compilacion']),
    imagen: z.string(),
    pdf: z.string().optional(),
    imagen_link: z.string().optional(),
    imagenes: z.array(z.union([z.string(), z.object({
      src: z.string(),
      link: z.string().optional(),
    })])).optional(),
    primera_edicion: z.object({
      editorial: z.string(),
      anio: z.number(),
      lugar: z.string().optional(),
    }).optional(),
    ultima_edicion: z.object({
      editorial: z.string(),
      anio: z.number(),
      lugar: z.string().optional(),
      url: z.string().optional(),
    }).optional(),
    traducciones: z.array(z.object({
      titulo: z.string(),
      idioma: z.string(),
      lugar: z.string(),
      anio: z.number().optional(),
      imagen: z.string().optional(),
    })).optional(),
    enlaces: z.array(z.object({
      titulo: z.string(),
      url: z.string(),
    })).optional(),
    orden: z.number().optional(),
  }),
});

export const collections = { noticias, slider, libros };

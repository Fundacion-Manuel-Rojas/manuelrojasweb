import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const noticias = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/noticias' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    fecha: z.string().or(z.date().transform(d => d.toISOString().split('T')[0])),
    autor: z.string().optional(),
    categoria: z.string().optional(),
    imagen: z.string().optional(),
    extracto: z.string().optional(),
    destacado: z.boolean().optional(),
  }),
});

const slider = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/slider' }),
  schema: z.object({
    title: z.string(),
    imagen: z.string(),
    alt: z.string().optional(),
    enlace: z.string().optional(),
    orden: z.number().optional(),
  }),
});

export const collections = { noticias, slider };

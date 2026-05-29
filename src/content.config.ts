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

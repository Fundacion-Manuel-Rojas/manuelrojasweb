# Fundación Manuel Rojas

Sitio web Fundación Manuel Rojas (https://manuelrojas.cl)

## Descripción

Sitio web estático construido con [Astro](https://astro.build) para la Fundación Manuel Rojas, dedicada a preservar y difundir la obra del escritor chileno Manuel Rojas.

## Características

- Sitio estático generado con Astro 6.3
- Gestión de contenido con Keystatic CMS
- Diseño responsive con Tailwind CSS
- Páginas estáticas migradas desde WordPress
- Sistema de noticias con colecciones de contenido

## Comandos

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo (Keystatic en /keystatic)

# Producción
npm run build        # Build estático a dist/
npm run preview      # Previsualizar build local

# Migración
npm run scrape       # Re-scrapear páginas desde WordPress
```

## Estructura del proyecto

```
src/
├── layouts/         # Layout principal (Layout.astro)
├── pages/           # Páginas estáticas (.astro)
├── content/         # Colecciones de contenido (Keystatic)
└── styles/          # (vacío - CSS en Layout.astro)

public/
└── media/           # Archivos multimedia

scripts/
└── scrape.mjs       # Script de migración WordPress
```

## Stack tecnológico

- **Framework:** Astro 6.3
- **CMS:** Keystatic
- **CSS:** Tailwind CSS 4.3
- **UI:** React 19, Alpine.js
- **Build:** Estático (SSG)

## Despliegue

El sitio está configurado para despliegue en Netlify con formato de directorio (`dist/`).

## Licencia

© Fundación Manuel Rojas. Todos los derechos reservados.

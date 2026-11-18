# Fundación Manuel Rojas

Sitio web de la Fundación Manuel Rojas (https://manuelrojas.cl)

## Descripción

Sitio web estático construido con [Astro](https://astro.build) para la Fundación Manuel Rojas, dedicada a preservar y difundir la obra del escritor chileno Manuel Rojas.

## Características

- Sitio estático generado con Astro 7
- Gestión de contenido con Keystatic CMS (admin en `/keystatic`)
- Diseño responsive con Tailwind CSS 4
- Contenido por colecciones (noticias, libros, premios, publicaciones, estudios, secciones de obra y slider)
- Páginas estáticas heredadas de WordPress

## Requisitos

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) como gestor de paquetes

## Comandos

```bash
# Instalar dependencias
pnpm install

# Desarrollo
pnpm run dev          # Servidor de desarrollo (Keystatic en /keystatic)

# Producción
pnpm run build        # Build estático a dist/ (emite la función SSR de Netlify)
pnpm run preview      # Previsualizar el build local
```

## Estructura del proyecto

```
src/
├── layouts/         # Layout principal (Layout.astro)
├── pages/           # Páginas estáticas (.astro)
├── components/      # Componentes (Header, Footer, ObraSection, ...)
├── content/         # Colecciones de contenido (.mdoc, gestionadas con Keystatic)
└── styles/          # global.css (Tailwind v4)

public/
└── media/           # Archivos multimedia subidos desde Keystatic
```

## Stack tecnológico

- **Framework:** Astro 7
- **CMS:** Keystatic
- **CSS:** Tailwind CSS 4.3
- **UI:** React 19, Alpine.js
- **Build:** Estático (SSG) con adapter Netlify

## Despliegue

El sitio está configurado para despliegue en Netlify (adapter `@astrojs/netlify`), con formato de directorio y salida en `dist/`.

## Licencia

© Fundación Manuel Rojas. Todos los derechos reservados.

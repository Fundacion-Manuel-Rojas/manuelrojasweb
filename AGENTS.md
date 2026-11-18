# AGENTS.md — manuelrojas-astro

Astro 7 static site for **Fundación Manuel Rojas** (manuelrojas.cl). Netlify adapter. Keystatic CMS for content. Tailwind CSS 4.

## Essentials

- **Package manager:** `pnpm`. Use `pnpm install`; `package-lock.json`/`yarn.lock` are ignored.
- **No tests, no lint, no typecheck, no CI.** The only verification step is `pnpm run build`.
- `pnpm-workspace.yaml` allowlists native build scripts (`sharp`, `esbuild`, `@parcel/watcher`) via pnpm's `onlyBuiltDependencies`/`allowBuilds`.

## Commands

| Command | What it does |
|---|---|
| `pnpm run dev` | Dev server; Keystatic admin UI at `/keystatic` |
| `pnpm run build` | Wipes `.astro/`, `node_modules/.astro/`, and `dist/`, then builds. Emits a Netlify SSR function. |
| `pnpm run preview` | Preview the built site locally |

## Keystatic

- Integration is conditional in `astro.config.mjs`: `process.env.SKIP_KEYSTATIC` removes it. It is **not** set automatically by the build script.
- `keystatic.config.ts` uses local storage in dev (`import.meta.env.PROD` is false) and Keystatic Cloud project `devel/manuelrojasweb` in production.

## Content

Seven collections in `src/content.config.ts`:

| Collection | Loader | Files | Rendered at |
|---|---|---|---|
| `noticias` | `glob` | `src/content/noticias/*/index.mdoc` | `/noticias/[slug]/` |
| `libros` | `glob` | `src/content/libros/*.mdoc` | `/libros/[slug]/` |
| `obra_secciones` | `glob` | `src/content/obra_secciones/*.mdoc` | `/manuel-rojas/obra/<seccion>/` via `ObraSection.astro` |
| `slider` | **Custom** | `src/content/slider/<slug>.mdoc` + `src/content/slider/<slug>/texto.mdx` | Home page slider |
| `premios` | `glob` | `src/content/premios/*.mdoc` | `/sobre-su-obra/premios/` |
| `publicaciones` | `glob` | `src/content/publicaciones/*.mdoc` | `/sobre-su-obra/publicaciones_estudios/` |
| `estudios` | `glob` | `src/content/estudios/*.mdoc` | `/sobre-su-obra/publicaciones_estudios/` (sección ESTUDIOS) |

**`obra_secciones`:** drives the legacy "Obra" subpages (`/manuel-rojas/obra/*`). Each section has a Markdoc `introduccion` plus an optional `listado_manual` (array of `href`/`img`/`title`) that overrides the automatic per-category book list. Rendered by `src/components/ObraSection.astro` (`getEntry('obra_secciones', sectionSlug)`).

**Custom slider loader** (`sliderLoader()`): manually parses YAML frontmatter from `.mdoc` and reads the sibling MDX file. It is not a standard Astro loader; editing the schema or loader requires understanding the hand-rolled parser.

**Dual content (noticias + libros):** legacy static pages still live under `src/pages/` (e.g., dated paths like `src/pages/2020/07/12/angelita-jeria.astro` and `src/pages/manuel-rojas/obra/*.astro`). The `.mdoc` collections are the source of truth. Prefer linking to `/noticias/<slug>/` and `/libros/<slug>/` rather than the legacy static paths.

**Noticias slug quirk:** glob entries are directories with `index.mdoc`, so entry IDs end in `/index`. Dynamic routes strip it with `n.id.replace('/index', '')`.

**Images:** Keystatic stores uploaded images in `public/media/` (and subdirectories). Default Open Graph image is `/media/default_noticias.webp` (not `.jpg`).

## Layout & styling

- `src/layouts/Layout.astro` is the single layout. It imports global styles from `src/styles/global.css` (Tailwind v4 with `@import "tailwindcss"`). CSS is no longer inline-only.
- Header, nav, and footer are `src/components/Header.astro` and `src/components/Footer.astro`.

## Build / deploy

- `astro.config.mjs`: `output: 'static'`, `trailingSlash: 'ignore'`, `build.format: 'directory'`.
- `netlify.toml`: publishes `dist/`, sets aggressive cache headers for `/media/*` and `/_astro/*`.

## Gotchas

- The nav menu is hardcoded in `src/components/Header.astro`; add/remove top-level sections there.
- The slider auto-advances every 10s and only shows dots when there are 2+ slides.
- Do **not** run `pnpm build` while `pnpm dev` is running. The build's `rm -rf .astro node_modules/.astro dist` wipes the dev server's cache, which makes some pages (notably legacy `/manuel-rojas/obra/*`) load without CSS: the dev server starts referencing stale build hashes like `/_astro/Layout.*.css` and those 404. Fix: stop dev, `rm -rf dist .astro node_modules/.astro`, restart `pnpm dev`.
- This file is listed in `.gitignore` but is currently tracked by git.

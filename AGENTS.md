# AGENTS.md — manuelrojas-astro

Astro 7 static site for **Fundación Manuel Rojas** (manuelrojas.cl). Netlify adapter. Keystatic CMS for content. Tailwind CSS 4.

## Essentials

- **Package manager:** `pnpm`. Use `pnpm install`; `package-lock.json`/`yarn.lock` are ignored.
- **No tests, no lint, no typecheck, no CI.** The only verification step is `pnpm run build`.
- README says Astro 6.3 — the actual dependency is Astro 7 (`package.json`).

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

Three collections in `src/content.config.ts`:

| Collection | Loader | Files | Rendered at |
|---|---|---|---|
| `noticias` | `glob` | `src/content/noticias/*/index.mdoc` | `/noticias/[slug]/` |
| `libros` | `glob` | `src/content/libros/*.mdoc` | `/libros/[slug]/` |
| `slider` | **Custom** | `src/content/slider/<slug>.mdoc` + `src/content/slider/<slug>/texto.mdx` | Home page slider |

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

- The old WordPress scrape script (`scripts/scrape.mjs`) mentioned in README no longer exists.
- The nav menu is hardcoded in `src/components/Header.astro`; add/remove top-level sections there.
- The slider auto-advances every 10s and only shows dots when there are 2+ slides.
- This file is listed in `.gitignore` but is currently tracked by git.

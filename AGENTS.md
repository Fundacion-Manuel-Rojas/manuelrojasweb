# AGENTS.md — manuelrojas-astro

Astro 6 static site for **Fundación Manuel Rojas** (manuelrojas.cl). Migrated from WordPress/Divi. Uses **Keystatic CMS** for content and **Tailwind CSS** for styling.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with Keystatic admin UI at `/keystatic` |
| `npm run build` | Static build to `dist/` (Keystatic is **already skipped** via `SKIP_KEYSTATIC=true` in package.json) |
| `npm run preview` | Preview built site locally |
| `npm run scrape` | **Destructive.** Re-scrapes WordPress live site, **deletes** all `src/pages/*.astro` (except `libros/`, `noticias/`, `admin/`, `env.d.ts`) and recreates them. Do not run with uncommitted page edits. |

## Build quirks

- Keystatic integration is conditional: `process.env.SKIP_KEYSTATIC` removes it from the Astro integrations array. `npm run build` sets it automatically; `npm run dev` does not.
- `trailingSlash: 'ignore'`, `format: 'directory'` — outputs `dist/<route>/index.html`.
- All CSS lives inline in `src/layouts/Layout.astro`. `src/styles/` is empty.
- No tests, no linting, no typecheck scripts, no CI.

## Content architecture

Three content collections defined in `src/content.config.ts`:

| Collection | Loader | Files | Rendered at |
|---|---|---|---|
| `noticias` | `glob` | `src/content/noticias/*.mdoc` | `/noticias/[slug]/` |
| `libros` | `glob` | `src/content/libros/*.mdoc` | `/libros/[slug]/` |
| `slider` | **Custom** | `src/content/slider/*.mdoc` + `*/texto.mdx` | Home page slider |

### Critical: custom slider loader

The `slider` collection does **not** use Astro's `glob` loader. `content.config.ts` defines a `sliderLoader()` that:
1. Parses frontmatter manually from `.mdoc` files (basic YAML parser, not a full YAML engine)
2. Reads MDX content from a sibling `texto.mdx` inside each entry's directory (e.g. `slider/autorretrato/texto.mdx`)
3. Stores parsed data via `context.store.set()`

Editing the slider schema or loader requires understanding this custom parser.

### Dual content: static pages + CMS entries

Both `noticias` and `libros` exist in **two forms**:
- **Legacy static pages**: dated `.astro` files in `src/pages/` (scraped from WordPress), e.g. `src/pages/2020/07/12/angelita-jeria.astro`
- **CMS source of truth**: `.mdoc` files in `src/content/noticias/` and `src/content/libros/`

Dynamic routes (`/noticias/[slug].astro`, `/libros/[slug].astro`) render from the CMS collections. Static pages still exist for backward compatibility but are NOT the preferred source.

### Keystatic image field paths

Images uploaded via Keystatic are saved to `public/media/` (or subdirectories like `public/media/noticias/`, `public/media/slider/`). The `publicPath` in `keystatic.config.ts` determines the URL prefix.

## Page inventory (approximate)

- Static `.astro` pages: ~106 (includes ~46 legacy blog posts, ~50 individual book pages, landings)
- Dynamic routes: 2 (`/libros/[slug]`, `/noticias/[slug]`)
- CMS entries: ~38 noticias, ~36 libros, ~5 slider items

## Important file references

- `src/layouts/Layout.astro` — single layout, all CSS, nav, footer, Open Graph meta tags
- `src/content.config.ts` — collection schemas and custom slider loader
- `keystatic.config.ts` — CMS collection schemas (noticias, libros, slider)
- `scripts/scrape.mjs` — WordPress migration script (destructive)

## Social sharing

- `/admin/` — manual sharing page for noticias (Twitter/X, Facebook, LinkedIn, WhatsApp, copy link)
- `netlify/functions/share-webhook.js` — webhook receiver for automation (optional Slack integration via `SLACK_WEBHOOK_URL`)
- Default Open Graph image: `/media/default_noticias.jpg`

## Gotchas

- `npm run scrape` will wipe all your static pages. Commit first.
- The slider loader is custom and fragile; changes to Markdoc/MDX handling in Astro may break it.
- Many static book pages under `src/pages/manuel-rojas/obra/` likely have corresponding `.mdoc` entries in `src/content/libros/`. Prefer linking to `/libros/<slug>/` instead of the static `/manuel-rojas/obra/<slug>` paths.
- The repo uses pnpm (`pnpm` field in `package.json`).

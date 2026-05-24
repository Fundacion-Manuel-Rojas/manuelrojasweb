# AGENTS.md — manuelrojas-astro


## Pendientes

- Transformar los elementos de noticias del html completo que tienen ahora a página de astro estilada bien con tailwind siguiendo estilos del sitio web
- Unificar las vistas de cards de publicaciones y de cada elemento
- Trabajar estilos de las imagenes
- Revisar multimedias
- Revisar scripts para publicar posts a redes sociales — ✅ Implementado (ver sección Compartir en redes)


## Project

Astro 6.3 static site for **Fundación Manuel Rojas** (https://manuelrojas.cl). Migrated from a WordPress site using Divi/Theme Builder. Includes **Keystatic CMS** for content management.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start Astro dev server (Keystatic admin UI at `/keystatic`) |
| `npm run build` | Build static output to `dist/` (use `SKIP_KEYSTATIC=true npm run build` for production) |
| `npm run preview` | Preview the built site locally |
| `npm run scrape` | Re-scrape pages from live WordPress site → regenerates `src/pages/*.astro` and downloads media to `public/media/` |

## Architecture

- **Single layout**: `src/layouts/Layout.astro` — all CSS lives here (no separate stylesheets; `src/styles/` is empty)
- **Static pages (scraped)**: `src/pages/` — flat `.astro` files, each with `set:html` containing WordPress Divi markup
- **Noticias (CMS-managed)**: `src/content/noticias/` — `.mdoc` files edited via Keystatic, rendered at `/noticias/` and `/noticias/[slug]/`
- **Keystatic config**: `keystatic.config.ts` — defines the `noticias` collection schema
- **Content collections**: `src/content.config.ts` — Astro content layer with `glob` loader for `.mdoc` files
- **Static assets**: `public/media/` — images downloaded from WordPress `wp-content/uploads/`
- **Scrape scripts**: `scripts/scrape.mjs` (full migration), `scripts/fix-extraction.mjs` (debug page structure)

## Build notes

- `SKIP_KEYSTATIC=true` is required for static builds in production (Keystatic requires SSR routes)
- Pages use `trailingSlash: 'ignore'` in `astro.config.mjs`
- Build format is `directory` (not `file`) — output is `dist/page/index.html`, not `dist/page.html`
- All scraped page content is `set:html` with raw WordPress HTML
- Noticias pages use Astro content collections with `render()` from `astro:content`

## Keystatic usage

1. Run `npm run dev` to start dev server with Keystatic admin UI
2. Visit `http://localhost:4321/keystatic` to manage noticias
3. Content saves to `src/content/noticias/*.mdoc` as Markdoc files
4. For production builds: `SKIP_KEYSTATIC=true npm run build`
5. For production deploys, configure Keystatic GitHub mode or keep disabled

## Scrape script behavior

Running `npm run scrape` **deletes all existing pages** in `src/pages/` (except `layouts/`, `env.d.ts`, `content.config.ts`) before regenerating them. Do not run it if you have uncommitted page edits.


# Mapa del sitio — Fundación Manuel Rojas (sitio publicado)

```
https://manuelrojas.cl
```

---

## Esquema de navegación principal

- **Header** (navegación principal — `src/layouts/Layout.astro:127`)
- **Footer** (tres columnas — `src/layouts/Layout.astro:145`)

---

## Árbol completo del sitio

```
/
│
├── Inicio                                    →  /
│
├── Quiénes Somos                             →  /quienes-somos/
│   ├── Fundación                             →  /quienes-somos/fundacion/
│   ├── Integrantes                           →  /quienes-somos/integrantes/
│   └── Actividades                           →  /quienes-somos/actividades/
│
├── Manuel Rojas                              →  /manuel-rojas/
│   │
│   ├── Vida
│   │   ├── Biografía                         →  /manuel-rojas/vida/biografia/
│   │   └── Cronología                        →  /manuel-rojas/vida/cronologia/
│   │
│   ├── Obra
│   │   ├── Poesía                            →  /manuel-rojas/obra/poesia/
│   │   ├── Autobiografías y viajes           →  /manuel-rojas/obra/autobiografias_viajes/
│   │   ├── Novelas                           →  /novelas/
│   │   ├── Cuentos                           →  /cuentos-completos/
│   │   ├── Compilaciones                     →  /compilaciones/
│   │   ├── Poéticas                          →  /poeticas/
│   │   │
│   │   └── Libros (páginas individuales)
│   │       ├── Hijo de ladrón                →  /hijo-de-ladron/
│   │       ├── Lanchas en la bahía           →  /lanchas-en-la-bahia/
│   │       ├── Punta de rieles               →  /punta-de-rieles/
│   │       ├── La oscura vida radiante       →  /la-oscura-vida-radiante/
│   │       ├── Sombras contra el muro        →  /sombras-contra-el-muro/
│   │       ├── Tiempo irremediable           →  /tiempo-irremediable/
│   │       ├── Mejor que el vino             →  /mejor-que-el-vino/
│   │       ├── Tonada del transeúnte         →  /tonada-del-transeunte/
│   │       ├── Travesía                      →  /travesia/
│   │       ├── Deshecha rosa                 →  /deshecha-rosa/
│   │       ├── El vaso de leche              →  /el-vaso-de-leche/
│   │       ├── El delincuente                →  /el-delincuente/
│   │       ├── El hombre de la rosa          →  /el-hombre-de-la-rosa/
│   │       ├── El bonete maulino             →  /el-bonete-maulino/
│   │       ├── Canciones para ellos          →  /canciones-para-ellos/
│   │       ├── Hombres del sur               →  /hombres-del-sur/
│   │       ├── La ciudad de los Césares      →  /la-ciudad-de-los-cesares/
│   │       │
│   │       ├── Ensayos
│   │       │   ├── Ensayos completos I       →  /ensayos-completos-i/
│   │       │   ├── Ensayos 2                 →  /ensayos-2/
│   │       │   └── Ensayos I: El árbol siempre verde →  /ensayos-i-el-arbol-siempre-verde/
│   │       │
│   │       ├── Crítica / Estudios literarios
│   │       │   ├── El árbol siempre verde     →  /el-arbol-siempre-verde/
│   │       │   ├── Historia breve de la literatura chilena →  /historia-breve-de-la-literatura-chilena/
│   │       │   ├── Apuntes sobre la expresión escrita →  /apuntes-sobre-la-expresion-escrita/
│   │       │   ├── De la poesía a la revolución →  /de-la-poesia-a-la-revolucion-ensayo/  (↳ /2015/04/24/)
│   │       │   └── Esencias del país chileno: poesías →  /esencias-del-pais-chileno-poesias/
│   │       │
│   │       └── Antologías / Ediciones comentadas
│   │           ├── José Joaquín Vallejo       →  /jose-joaquin-vallejo/
│   │           ├── Los costumbristas chilenos →  /los-costumbristas-chilenos/
│   │           ├── Blest Gana: sus mejores páginas →  /blest-gana-sus-mejores-paginas/
│   │           ├── Mariano Latorre: algunos de sus mejores cuentos →  /mariano-latorre-algunos-de-sus-mejores-cuentos/
│   │           ├── Alberto Edwards: cuentos fantásticos →  /alberto-edwards-cuentos-fantasticos/
│   │           ├── Chile: 5 navegantes y 1 astrónomo →  /chile-5-navegantes-y-1-astronomo/
│   │           └── Cuentos (libro)            →  /obras_libro/cuentos-libro/
│   │
│   ├── Galería
│   │   ├── Fotografías                        →  /manuel-rojas/galeria/fotografias/
│   │   └── Audios                             →  /manuel-rojas/galeria/audios/
│   │
│   └── Sobre su obra (sección oculta en nav)
│       ├── Premios                            →  /sobre-su-obra/premios/
│       ├── Publicaciones y estudios           →  /sobre-su-obra/publicaciones_estudios/
│       ├── Exposiciones                       →  /sobre-su-obra/exposiciones/
│       └── Videos y audios                    →  /sobre-su-obra/videos_y_audios/
│
├── Noticias                                  →  /noticias/
│   │
│   │  📌 Página listado: HTML estático scrapeado (src/pages/noticias.astro)
│   │  📌 Contenido gestionable: Keystatic CMS → src/content/noticias/*.mdoc
│   │     └── /noticias/bienvenida/           (único .mdoc actual, 2026-05-08)
│   │
│   ├── 2020
│   │   ├── Angelita Jeria                    →  /2020/07/12/angelita-jeria/
│   │   ├── The Glass of Milk                 →  /2020/05/18/the-glass-of-milk/
│   │   └── Nochebuena en Santiago            →  /2020/03/02/guion-bajo-publica-uno-de-los-cuentos-ineditos-de-rojas-noche-buena-en-santiago/
│   │
│   ├── 2019
│   │   ├── Manuel Rojas en Alfaguara         →  /2019/12/20/prueba2/
│   │   ├── ¿Quiénes son los equivocados?     →  /2019/12/01/quienes-son-los-equivocados/
│   │   ├── Nuestra esperanza solo puede venir de los sin esperanza →  /2019/11/25/nuestra-esperanza-solo-puede-venir-de-los-sin-esperanza/
│   │   ├── Variedades de lumpen              →  /2019/11/13/variedades-de-lumpen/
│   │   ├── Chile no sueña inútilmente        →  /2019/11/09/chile-no-suena-inutilmente/
│   │   └── De qué se nutre la esperanza      →  /2019/10/17/de-que-se-nutre-la-esperanza/
│   │
│   ├── 2016
│   │   └── Hijo de ladrón / Hambre de vida   →  /2016/12/09/hijo-de-ladron-hambre-de-vida/
│   │
│   ├── 2015
│   │   └── De la poesía a la revolución (ensayo) →  /2015/04/24/de-la-poesia-a-la-revolucion-ensayo/
│   │
│   └── ⚠ Enlaces legacy (sin .astro — solo existen en el HTML scrapeado de /noticias/)
│       ├── 2016/09/09 — Una oscura y radiante vida
│       ├── 2016/07/01 — Hijo de ladrón / Novela gráfica
│       ├── 2016/05/21 — Obras mayores
│       ├── 2016/05/06 — Imágenes de infancia ampliadas
│       ├── 2015/09/27 — De la poesía a la revolución (noticia)
│       ├── 2015/07/19 — La banda Aniceto
│       ├── 2015/06/08 — Lanchas en la bahía (noticia)
│       ├── 2015/04/24 — Castellanos Moya en Chile
│       ├── 2015/04/24 — Con sus lectores
│       ├── 2015/04/24 — Castellanos Moya: El salvadoreño errante
│       ├── 2014/01/10 — El archivo Manuel Rojas
│       ├── 2013/12/04 — Piglia compara a Rojas con Arlt
│       ├── 2013/10/29 — González Vera reunido
│       ├── 2013/08/15 — Ricardo Piglia gana Premio Manuel Rojas 2013
│       ├── 2013/08/13 — Cuando se espera el sueño
│       ├── 2013/04/20 — La prosa nunca está terminada
│       ├── 2013/01/19 — Poéticas fronterizas
│       ├── 2013/01/11 — Antonio Avaria entrevista con Manuel Rojas
│       ├── 2013/01/11 — Germán Ewart / Manuel Rojas
│       ├── 2013/01/11 — Lenka Franulic: un personaje al trasluz
│       ├── 2012/09/27 — Rubem Fonseca gana Premio Manuel Rojas
│       ├── 2012/08/25 — Manuel Rojas vuelve a la cárcel de Valparaíso
│       ├── 2012/03/25 — Manuel Rojas "Po" / La brigada negotrópica
│       ├── 2012/03/25 — Cruce centenario de la cordillera
│       ├── 2011/09/06 — Exposición La oscura vida radiante
│       ├── 2011/06/07 — Homenaje de la APECH
│       └── 2010/11/11 — Manuel Rojas: nuevas lecturas
│
├── Contacto                                  →  /contacto/
│
└── Derechos de Autor                         →  /derechos-de-autor/
```

---

## Esquema técnico

### Tipos de contenido

| Tipo | Origen | Ruta en repo | Renderizado |
|------|--------|-------------|-------------|
| **Páginas estáticas** (WordPress scrapeado) | `set:html` con markup Divi | `src/pages/**/*.astro` | Astro file-based routing |
| **Noticias CMS** (Keystatic) | `.mdoc` (Markdoc) | `src/content/noticias/*.mdoc` | Content collections + `render()` |
| **Assets** (media) | Descargados de WordPress | `public/media/` | Servidos estáticamente |
| **Layout** (único) | Tailwind + CSS inline | `src/layouts/Layout.astro` | Wrapper de todas las páginas |

### Colecciones de contenido (`src/content.config.ts`)

```
noticias → glob: src/content/noticias/**/*.mdoc
  ├── title       (string, requerido)
  ├── subtitle    (string, opcional)
  ├── fecha       (date → ISO string)
  ├── autor       (string, opcional)
  ├── categoria   (string, opcional: destacado | noticias | entrevistas | anos-anteriores)
  └── content     (markdoc, cuerpo enriquecido)
```

### Keystatic CMS (`keystatic.config.ts`)

```
Admin UI: /keystatic (solo en dev)
Colección gestionable: noticias
Almacenamiento: local → src/content/noticias/
```

### Comandos clave

| Comando | Acción |
|---------|--------|
| `npm run dev` | Dev server (Astro + Keystatic) |
| `npm run build` | Build estático a `dist/` |
| `SKIP_KEYSTATIC=true npm run build` | Build producción (sin Keystatic) |
| `npm run scrape` | Re-scrapea WordPress → regenera `src/pages/` |

### Arquitectura de build

```
astro.config.mjs  →  output: 'static'
                   →  trailingSlash: 'ignore'
                   →  format: 'directory'
                   →  salida: dist/<ruta>/index.html
```

### Estructura de archivos clave

```
src/
├── layouts/
│   └── Layout.astro            ← Único layout (CSS inline, Tailwind, nav + footer)
├── pages/
│   ├── index.astro             ← Home
│   ├── quienes-somos.astro     ← Landing Quiénes Somos
│   ├── manuel-rojas.astro      ← Landing Manuel Rojas
│   ├── noticias.astro          ← Listado de noticias (HTML scrapeado)
│   ├── contacto.astro          ← Contacto
│   ├── derechos-de-autor.astro ← Derechos de autor
│   ├── 10035-2.astro           ← (WordPress legacy ID)
│   ├── 10914-2.astro           ← (WordPress legacy ID)
│   │
│   ├── quienes-somos/
│   │   ├── fundacion.astro
│   │   ├── integrantes.astro
│   │   └── actividades.astro
│   │
│   ├── manuel-rojas/
│   │   ├── vida/
│   │   │   ├── biografia.astro
│   │   │   └── cronologia.astro
│   │   ├── obra/
│   │   │   ├── poesia.astro
│   │   │   ├── autobiografias_viajes.astro
│   │   │   ├── novelas.astro
│   │   │   ├── cuentos-completos.astro
│   │   │   ├── compilaciones.astro
│   │   │   ├── poeticas.astro
│   │   │   ├── cuentos-libro.astro
│   │   │   └── [28 libros individuales más].astro
│   │   └── galeria/
│   │       ├── fotografias.astro
│   │       └── audios.astro
│   │
│   ├── sobre-su-obra/
│   │   ├── premios.astro
│   │   ├── publicaciones_estudios.astro
│   │   ├── exposiciones.astro
│   │   └── videos_y_audios.astro
│   │
│   └── AAAA/MM/DD/            ← Blog posts por fecha (2015, 2016, 2019, 2020)
│
├── content/
│   ├── config.ts               ← Definición de colecciones
│   └── noticias/
│       └── bienvenida.mdoc     ← Única entrada CMS actual
├── content.config.ts           ← Carga las colecciones
└── styles/                     ← Vacío (CSS en Layout.astro)

scripts/
├── scrape.mjs                  ← Migración completa WP → Astro
└── fix-extraction.mjs          ← Debug de estructura WP

keystatic.config.ts             ← Configuración del CMS
astro.config.mjs                ← Configuración de Astro
```

---

## Compartir en redes sociales

### Página de administración (Opción 1 - Manual)

Acceso: `/admin/` — Muestra todas las noticias con botones para compartir en:
- **Twitter/X** — Enlace directo
- **Facebook** — Enlace directo
- **LinkedIn** — Enlace directo
- **WhatsApp** — Mensaje directo
- **Copiar enlace** — Portapapeles

### Webhooks para automatización (Opción 3)

El function `netlify/functions/share-webhook.js` recibe webhooks y puede:
- Notificar a Slack/Discord cuando hay nueva noticia
- Preparar datos para Zapier/Make
- Integrarse con Buffer API

**URL del webhook:**
```
https://tu-site.netlify.app/.netlify/functions/share-webhook
```

**Payload esperado:**
```json
{
  "action": "create",
  "collection": "noticias",
  "slug": "mi-noticia",
  "data": {
    "title": "Título",
    "subtitle": "Subtítulo",
    "extracto": "Extracto...",
    "imagen": "/media/foto.jpg",
    "fecha": "2026-05-19"
  }
}
```

**Variable de entorno requerida:**
- `SLACK_WEBHOOK_URL` — Webhook de Slack (opcional)

### Meta tags para redes

- `Layout.astro` incluye Open Graph y Twitter Card automáticamente
- Cada noticia pasa `title`, `description` e `image` al layout
- Imagen por defecto: `/media/default_noticias.jpg`

### Flujo recomendado

1. Crea/edita noticia en Keystatic (`/keystatic`)
2. GitHub detecta cambio y despliega en Netlify
3. (Opcional) Netlify envía webhook a Zapier/Make
4. Zapier/Make publica en Twitter/Facebook/Instagram
5. o usa `/admin/` para compartir manualmente


---

## Resumen numérico

| Elemento | Cantidad |
|----------|----------|
| Páginas `.astro` totales | 67 |
| Páginas raíz (`src/pages/*.astro`) | 8 (landings + páginas legacy) |
| `manuel-rojas/obra/` (libros) | 37 `.astro` |
| `manuel-rojas/vida/` | 2 `.astro` |
| `manuel-rojas/galeria/` | 2 `.astro` |
| `quienes-somos/` | 3 `.astro` |
| `sobre-su-obra/` | 4 `.astro` |
| Blog por fecha (`AAAA/MM/DD/`) | 11 `.astro` |
| Entradas CMS (`.mdoc`) | 1 |
| Enlaces legacy sin página (rotos) | ~27 |
| Layouts | 1 |
| Colecciones de contenido | 1 (`noticias`) |


---




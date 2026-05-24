## Sitio web: Características y contenidos

Estos elementos están descritos en función de un sitio desktop, las versiones para dispositivos móviles deben considerarse al crear las vistas.

---

### Fondo del sitio

- Background general del sitio: imagen `/public/media/background.webp`
- Tipografía: `'Alice', Georgia, "Times New Roman", serif`
- Implementado: `src/layouts/Layout.astro:21-28` — `body` con `background: url('/media/background.webp') fixed center/cover`

### Contenedor del sitio

- Clase: `.site-wrapper` — flota sobre el background
- Dimensiones: `max-width: 1280px`, altura variable según contenido
- Márgenes: `margin: 30px auto`
- Fondo: `#fff`
- Bordes: `border-radius: 6px`
- Sombra: `box-shadow: 0 1px 6px rgba(0,0,0,0.08)`
- `overflow: hidden` para respetar bordes en header/footer
- Header y Footer incluidos dentro del contenedor
- Responsive: `max-width: 100%`, sin margen ni radius en mobile
- Implementado: `src/layouts/Layout.astro:76-83`

### Header

- Implementado: `src/components/Header.astro:120-135`
- Clase: `.site-header`
- Fondo: `#353535`
- Layout: flex con `justify-content: space-between`, `align-items: center`
- Logo: alineado izquierda, `width: 200px`, `height: auto`
- Respeta el `border-radius` del contenedor vía `overflow: hidden`

#### Íconos sociales (Header)

- Ubicación: dentro de `.site-header`, alineados a la derecha con `padding-right: 20px`
- Clase: `.social-icons` — flex row con `gap: 12px`
- Cada ícono: SVG inline de 16x16, círculo `#555` de 32x32, color `#ccc`
- Hover:
  - Facebook (`.fb`): `#1877F2`
  - Twitter (`.tw`): `#1DA1F2`
  - Vimeo (`.vm`): `#1AB7EA`
- Implementado: `src/components/Header.astro:10-36, 124-134`

### Menú

- Implementado: `src/components/Header.astro:38-193`
- Clase: `.site-nav` — ubicado bajo el header
- Fondo: `#474747`
- Sombras: `box-shadow: 0 4px 8px rgba(0,0,0,0.3)` con `z-index: 20` para quedar sobre el slider
- Tipografía: uppercase (`text-transform: uppercase`, `letter-spacing: 1px`)
- Color links: `#ccc`, hover: `#fff`
- Tamaño: `14px`, `font-weight: 600`
- Alineación: centrado (`justify-content: center`)
- Submenus: Quienes Somos -> Fundación / Integrantes / Actividades
- Submenus: Manuel Rojas -> Vida / Obra / Galería
    * Vida -> Biografía / Cronología
    * Obra -> Poesía / Ensayos / Autobiografías y Viajes / Novelas / Cuentos / Compilaciones
    * Galería -> Fotografías / Audios
- Sobre su obra -> Premios / Publicaciones y Estudios / Exposiciones / Videos y Audios
- Noticias

### Slider del Home

- Implementado: `src/components/Slider.astro`
- Gestionado desde Keystatic CMS (colección `slider` en `keystatic.config.ts`)
- Dimensiones: 100% ancho, 500px alto (desktop)
- Imágenes con `object-fit: cover`
- Auto-play cada 5s, navegación con flechas y dots
- Responsive: 280px en tablet (≤768px), 200px en mobile (≤480px)
- Usado en: `src/pages/index.astro:8` — reemplaza el antiguo MasterSlider de WordPress

### Contenido interno

- Clase: `.inner` — ancho de contenido dentro del wrapper
- `width: 80%`, `max-width: 1080px`, `margin: auto`
- Usado SOLO en `.site-footer` (ya no envuelve `#main-content`)
- `#main-content` no tiene wrapper por defecto — cada página controla su propio ancho

### Footer

- Implementado: `src/components/Footer.astro`
- Clase: `.site-footer`
- Fondo: `#222`, color texto: `#ccc`
- Tres columnas (Fundación, Archivo, Apoye)
- Flexbox con `flex-wrap`, `gap: 40px`
- Padding: `40px 0`, margin-top: `40px`

---

## Sistema de contenido (Keystatic CMS)

### Colecciones

| Colección | Ruta | Campos clave |
|-----------|------|-------------|
| `noticias` | `src/content/noticias/*.mdoc` | title, subtitle, fecha, autor, categoria, content (markdoc) |
| `slider` | `src/content/slider/*.mdoc` | title, imagen (image), alt, enlace, orden, content (markdoc) |

- Configuración: `keystatic.config.ts`
- Admin UI: `/keystatic` (solo en dev)
- Imágenes del slider: almacenadas en `public/media/slider/<slug>/` con `publicPath: '/media/slider/'`

### Content collections (Astro)

- Definidas en `src/content.config.ts`
- Loader: `glob` con pattern `**/*.mdoc`
- Colecciones: `noticias`, `slider`

---

## Arquitectura del proyecto

Ver `AGENTS.md` para detalles completos de build, comandos y estructura de archivos.

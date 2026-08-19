import { config, fields, collection } from "@keystatic/core";

// En desarrollo local usamos almacenamiento local para que los cambios en
// /keystatic se reflejen inmediatamente en src/content/... En producción
// (npm run build / deploy) seguimos usando Keystatic Cloud.
// Usamos import.meta.env en lugar de process porque este archivo también se
// ejecuta en el navegador al hidratar el panel de Keystatic.
const useCloud = import.meta.env.PROD;

export default config({
  storage: {
    kind: useCloud ? "cloud" : "local",
  },
  cloud: useCloud
    ? {
        // TODO: Reemplaza con tu team/project de https://keystatic.cloud
        // Ejemplo: project: 'fundacion-rojas/manuelrojas',
        project: "devel/manuelrojasweb",
        branch: "master",
      }
    : undefined,
  collections: {
    noticias: collection({
      label: "Noticias",
      slugField: "title",
      columns: ["title", "fecha", "categoria"],
      path: "src/content/noticias/*/",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        title: fields.slug({ name: { label: "Título" } }),
        subtitle: fields.text({ label: "Subtítulo", multiline: true }),
        fecha: fields.date({ label: "Fecha" }),
        autor: fields.text({ label: "Autor" }),
        categoria: fields.select({
          label: "Categoría",
          options: [
            { label: "Noticias", value: "noticias" },
            { label: "Entrevistas", value: "entrevistas" },
            { label: "Años anteriores", value: "anos-anteriores" },
          ],
          defaultValue: "noticias",
        }),
        destacado: fields.checkbox({ label: "Mostrar en home" }),
        imagen: fields.image({
          label: "Imagen destacada",
          directory: "public/media/noticias",
          publicPath: "/media/noticias/",
        }),
        extracto: fields.text({
          label: "Extracto",
          multiline: true,
        }),
        galeria: fields.array(
          fields.object({
            imagen: fields.image({
              label: "Imagen",
              directory: "public/media/noticias",
              publicPath: "/media/noticias/",
            }),
            alt: fields.text({ label: "Texto alternativo (alt)" }),
            titulo: fields.text({
              label: "Título (opcional)",
              description: "Leyenda que aparece al abrir la imagen",
            }),
          }),
          {
            label: "Galería de imágenes",
            itemLabel: (props) =>
              props.fields.titulo.value ||
              props.fields.alt.value ||
              "Imagen",
          }
        ),
        content: fields.markdoc({
          label: "Contenido",
        }),
      },
    }),
    slider: collection({
      label: "Slider (Inicio)",
      slugField: "title",
      path: "src/content/slider/*",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        title: fields.slug({ name: { label: "Nombre de la diapositiva" } }),
        imagen: fields.image({
          label: "Imagen",
          directory: "public/media/slider",
          publicPath: "/media/slider/",
        }),
        alt: fields.text({ label: "Texto alternativo (alt)" }),
        texto: fields.mdx({
          label: "Texto sobre la imagen",
          description:
            "Texto blanco que aparece sobre la mitad de la imagen. Permite formato: negrita, cursiva, enlaces.",
        }),
        enlace: fields.text({ label: "Enlace (opcional)" }),
        orden: fields.number({
          label: "Orden",
          defaultValue: 0,
        }),
        content: fields.markdoc({
          label: "Contenido",
        }),
      },
    }),
    obra_secciones: collection({
      label: "Secciones de Obra",
      slugField: "titulo",
      columns: ["titulo", "categoria"],
      path: "src/content/obra_secciones/*",
      format: { contentField: "introduccion" },
      entryLayout: "content",
      schema: {
        titulo: fields.slug({ name: { label: "Título" } }),
        categoria: fields.select({
          label: "Categoría",
          options: [
            { label: "Poesía", value: "poesia" },
            { label: "Novela", value: "novela" },
            { label: "Cuento", value: "cuento" },
            { label: "Ensayo", value: "ensayo" },
            { label: "Autobiografía y Viajes", value: "autobiografia_viaje" },
            { label: "Compilación", value: "compilacion" },
          ],
          defaultValue: "poesia",
        }),
        orden: fields.number({ label: "Orden de visualización", defaultValue: 0 }),
        listado_manual: fields.array(
          fields.object({
            href: fields.text({ label: "URL del libro o página" }),
            img: fields.text({ label: "Ruta de la imagen de portada" }),
            title: fields.text({ label: "Título visible" }),
          }),
          {
            label: "Listado manual de libros (opcional)",
            description: "Solo para secciones que necesiten un orden o mix de URLs personalizado (ej: Novelas). Si se deja vacío se usa el listado automático por categoría.",
            itemLabel: (props) => props.fields.title.value || "Libro",
          }
        ),
        introduccion: fields.markdoc({
          label: "Introducción",
          description: "Texto introductorio que aparece en la página de la sección.",
        }),
      },
    }),
    libros: collection({
      label: "Libros",
      slugField: "titulo",
      columns: ["titulo", "categoria"],
      path: "src/content/libros/*",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        titulo: fields.slug({ name: { label: "Título" } }),
        categoria: fields.select({
          label: "Categoría",
          options: [
            { label: "Poesía", value: "poesia" },
            { label: "Novela", value: "novela" },
            { label: "Cuento", value: "cuento" },
            { label: "Ensayo", value: "ensayo" },
            { label: "Autobiografía y Viajes", value: "autobiografia_viaje" },
            { label: "Compilación", value: "compilacion" },
          ],
          defaultValue: "poesia",
        }),
        imagen: fields.image({
          label: "Imagen principal",
          description: "Archivo de imagen de portada (webp, jpg o png).",
          directory: "public/media",
          publicPath: "/media/",
          validation: { isRequired: true },
        }),
        pdf: fields.file({
          label: "Archivo PDF del libro",
          directory: "public/media",
          publicPath: "/media/",
        }),
        imagen_link: fields.text({
          label: "Enlace de imagen principal (URL externa o ruta /media/...)",
        }),
        imagenes: fields.array(
          fields.object({
            src: fields.image({
              label: "Imagen",
              directory: "public/media",
              publicPath: "/media/",
              validation: { isRequired: true },
            }),
            link: fields.text({ label: "Enlace (opcional)" }),
          }),
        ),
        ediciones: fields.array(
          fields.object({
            nombre: fields.text({
              label: "Nombre de la edición",
              description: "Ej: Primera edición, Segunda edición, Última edición",
            }),
            editorial: fields.text({ label: "Editorial" }),
            anio: fields.number({ label: "Año" }),
            lugar: fields.text({ label: "Lugar" }),
            url: fields.text({ label: "URL de compra o información" }),
          }),
          {
            label: "Ediciones",
            itemLabel: (props) => props.fields.nombre.value || "Edición",
          }
        ),
        traducciones: fields.array(
          fields.object({
            titulo: fields.text({ label: "Título en traducción" }),
            idioma: fields.text({ label: "Idioma" }),
            lugar: fields.text({ label: "Lugar" }),
            anio: fields.number({ label: "Año" }),
            imagen: fields.image({
              label: "Imagen (opcional)",
              directory: "public/media",
              publicPath: "/media/",
            }),
          }),
        ),
        enlaces: fields.array(
          fields.object({
            titulo: fields.text({ label: "Título del enlace" }),
            url: fields.text({ label: "URL" }),
          }),
        ),
        orden: fields.number({ label: "Orden de visualización" }),
        content: fields.markdoc({ label: "Reseña/Contenido" }),
      },
    }),
    premios: collection({
      label: "Premios",
      slugField: "titulo",
      columns: ["titulo", "orden"],
      path: "src/content/premios/*",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        titulo: fields.slug({ name: { label: "Título" } }),
        imagen: fields.image({
          label: "Imagen",
          directory: "public/media/premios",
          publicPath: "/media/premios/",
          validation: { isRequired: true },
        }),
        texto_imagen: fields.text({
          label: "Texto de imagen",
          description: "Leyenda o pie de foto que aparece debajo de la imagen.",
          multiline: true,
        }),
        destacar_inicio: fields.checkbox({
          label: "Destacar primera letra",
          description: "Aplica el estilo de letra capitular al primer párrafo.",
        }),
        orden: fields.number({
          label: "Orden de visualización",
          defaultValue: 0,
        }),
        content: fields.markdoc({ label: "Cuerpo de texto" }),
      },
    }),
    publicaciones: collection({
      label: "Publicaciones y Estudios",
      slugField: "titulo",
      columns: ["titulo", "autor", "orden"],
      path: "src/content/publicaciones/*",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        titulo: fields.slug({ name: { label: "Título" } }),
        subtitulo: fields.text({ label: "Subtítulo" }),
        autor: fields.text({ label: "Autor / Edición" }),
        editorial_info: fields.text({ label: "Editorial, lugar y año" }),
        imagen: fields.image({
          label: "Imagen de portada",
          directory: "public/media/publicaciones",
          publicPath: "/media/publicaciones/",
          validation: { isRequired: true },
        }),
        titulo_url: fields.url({
          label: "URL del título",
          description: "Enlace externo al que apunta el título de la publicación (opcional).",
        }),
        texto_destacado: fields.text({
          label: "Texto destacado",
          description: "Texto del bloque gris al final de la publicación. Usa Markdown básico: **negrita**, *cursiva*, [enlace](url).",
          multiline: true,
        }),
        orden: fields.number({
          label: "Orden de visualización",
          defaultValue: 0,
        }),
        content: fields.markdoc({ label: "Cuerpo de texto" }),
      },
    }),
    estudios: collection({
      label: "Estudios",
      slugField: "titulo",
      path: "src/content/estudios/*",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        titulo: fields.slug({ name: { label: "Título" } }),
        content: fields.markdoc({
          label: "Lista de estudios",
          description: "Lista de estudios que aparece al final de la página. Usa una lista de Markdown (- elemento) y [enlaces](url).",
        }),
      },
    }),
  },
});

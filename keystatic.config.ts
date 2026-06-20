import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: {
    kind: "cloud",
  },
  cloud: {
    // TODO: Reemplaza con tu team/project de https://keystatic.cloud
    // Ejemplo: project: 'fundacion-rojas/manuelrojas',
    project: "devel/fmanuelrojasweb",
    branch: "master",
  },
  collections: {
    noticias: collection({
      label: "Noticias",
      slugField: "title",
      columns: ["title", "fecha", "categoria"],
      path: "src/content/noticias/*",
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
        imagen: fields.text({
          label: "Imagen destacada (ruta /media/noticias/...)",
          description: "Ruta de la imagen, ej. /media/noticias/angelita-jeria/imagen.webp",
        }),
        extracto: fields.text({
          label: "Extracto",
          multiline: true,
        }),
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
          directory: "public/media",
          publicPath: "/media/",
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
            }),
            link: fields.text({ label: "Enlace (opcional)" }),
          }),
        ),
        primera_edicion: fields.object({
          editorial: fields.text({ label: "Editorial" }),
          anio: fields.number({ label: "Año" }),
          lugar: fields.text({ label: "Lugar" }),
        }),
        ultima_edicion: fields.object({
          editorial: fields.text({ label: "Editorial" }),
          anio: fields.number({ label: "Año" }),
          lugar: fields.text({ label: "Lugar" }),
          url: fields.text({ label: "URL de compra" }),
        }),
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
  },
});

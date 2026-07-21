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
        imagen: fields.file({
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
  },
});

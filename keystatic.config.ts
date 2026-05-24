import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    noticias: collection({
      label: 'Noticias',
      slugField: 'title',
      columns: ['title', 'fecha', 'categoria'],
      path: 'src/content/noticias/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
        fecha: fields.date({ label: 'Fecha' }),
        autor: fields.text({ label: 'Autor' }),
        categoria: fields.select({
          label: 'Categoría',
          options: [
            { label: 'Destacado', value: 'destacado' },
            { label: 'Noticias', value: 'noticias' },
            { label: 'Entrevistas', value: 'entrevistas' },
            { label: 'Años anteriores', value: 'anos-anteriores' },
          ],
          defaultValue: 'noticias',
        }),
        destacado: fields.checkbox({ label: 'Mostrar en home' }),
        imagen: fields.image({
          label: 'Imagen destacada',
          directory: 'public/media/noticias',
          publicPath: '/media/noticias/',
        }),
        extracto: fields.text({
          label: 'Extracto',
          multiline: true,
        }),
        content: fields.markdoc({
          label: 'Contenido',
        }),
      },
    }),
    slider: collection({
      label: 'Slider (Inicio)',
      slugField: 'title',
      path: 'src/content/slider/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Nombre de la diapositiva' } }),
        imagen: fields.image({
          label: 'Imagen',
          directory: 'public/media/slider',
          publicPath: '/media/slider/',
        }),
        alt: fields.text({ label: 'Texto alternativo (alt)' }),
        enlace: fields.text({ label: 'Enlace (opcional)' }),
        orden: fields.number({
          label: 'Orden',
          defaultValue: 0,
        }),
        content: fields.markdoc({
          label: 'Contenido',
        }),
      },
    }),
  },
});
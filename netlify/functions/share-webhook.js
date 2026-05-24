/**
 * Netlify Function: share-webhook
 * 
 * Este function recibe notificaciones de cambios en contenido
 * y puede enviar mensajes a Slack, Discord, o preparar datos para compartir.
 * 
 * Para usarlo con Zapier/Make:
 * 1. Configura un Webhook en Zapier/Make que apunte a:
 *    https://tu-site.netlify.app/.netlify/functions/share-webhook
 * 
 * 2. Zapier/Make puede hacer el trabajo de publicar a Twitter/Facebook
 *    usando sus integraciones nativas después de recibir el webhook.
 * 
 * Para integraciones directas a redes sociales, considera:
 * - Buffer API (https://buffer.com/developers/api)
 * - NextJS + Vercel (con API routes)
 */

exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    
    // Payload esperado desde Netlify/Keystatic:
    // { 
    //   action: 'create' | 'update' | 'delete',
    //   collection: 'noticias',
    //   slug: 'nombre-del-slug',
    //   data: { title, subtitle, imagen, extracto, fecha, ... }
    // }
    
    const { action, collection, slug, data } = payload;
    
    console.log('Webhook recibido:', { action, collection, slug });
    
    // Preparar datos para compartir
    const siteUrl = process.env.URL || 'https://manuelrojas.cl';
    const shareUrl = `${siteUrl}/noticias/${slug}/`;
    
    const shareData = {
      title: data?.title || data?.subtitle || 'Nueva noticia',
      excerpt: data?.extracto || '',
      image: data?.imagen ? `${siteUrl}${data.imagen}` : `${siteUrl}/media/default_noticias.jpg`,
      url: shareUrl,
      twitterText: encodeURIComponent(`${data?.title || data?.subtitle || 'Nueva noticia'} ${data?.extracto || ''}`.substring(0, 200)),
    };
    
    // Log para debugging
    console.log('Datos para compartir:', shareData);
    
    // Enivar a Slack/Discord si está configurado
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    if (slackWebhook && collection === 'noticias') {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `📢 *Nueva noticia:* ${shareData.title}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${data?.title || data?.subtitle || 'Nueva noticia'}*\n\n${data?.extracto || ''}`
              }
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'Ver noticia' },
                  url: shareUrl
                }
              ]
            }
          ]
        })
      });
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Webhook procesado',
        shareData,
      }),
    };
    
  } catch (error) {
    console.error('Error procesando webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno' }),
    };
  }
};
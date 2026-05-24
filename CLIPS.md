1. Página de administración /admin/
- Muestra todas las noticias con imagen, título y extracto
- Botones para compartir en: Twitter, Facebook, LinkedIn, WhatsApp
- Botón "Copiar enlace" para cada noticia
- Link directo al detalle de cada noticia
2. Netlify Function netlify/functions/share-webhook.js
- Recibe webhooks (POST)
- Prepara datos para compartir (título, URL, imagen, extracto)
- Envía notificaciones a Slack si está configurado SLACK_WEBHOOK_URL
- Compatible con Zapier/Make para automatización
3. Meta tags para redes
- Layout.astro ahora acepta description, image y twitterCard
- Las páginas de noticias pasan estos datos automáticamente
- Open Graph y Twitter Card para previsualización en compartir
Cómo usar:
Manual: Ve a /admin/ y haz clic en los botones de compartir
Automático con Zapier/Make:
1. Configura un webhook en Zapier que apunte a https://tu-site.netlify.app/.netlify/functions/share-webhook
2. Cuando dispares el webhook, recibirás los datos de la noticia en tu Zapier
3. Usa el módulo de Twitter/Facebook de Zapier para publicar
Notificación Slack:
1. Configura SLACK_WEBHOOK_URL en Netlify
2. Cada vez que llegue un webhook, recibirás un mensaje en Slack

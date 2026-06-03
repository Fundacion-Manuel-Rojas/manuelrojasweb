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
4. Configura SLACK_WEBHOOK_URL en Netlify
5. Cada vez que llegue un webhook, recibirás un mensaje en Slack

…el olor de la ñipa me detiene en las calles de mi barrio, me parece llevar siempre en las manos el aroma de los peumos, y el canto de un pájaro desconocido me sobrecoge tanto como un pensamiento inesperado…

Chile, País Vivido

La experiencia me ha ido dando los temas. Escribo sobre lo que conozco, de lo que la vida me ha hecho sentir. Soy un escritor que ha vivido en numerosos ambientes y tuve la suerte de entrar en la literatura chilena después de conocer mucho de Argentina y Chile...

Revista Árbol de Letras

¿No has visto a Wagner?, mientras jugamos o nos bañamos va hacia las rocas, se sienta, pone una mano tras una de sus orejas y canta… Debe llegar un instante en que la dulzura de su voz se encuentre, dentro de él, con el deseo de libertad y tal vez de amor que sale del corazón humano, por enfermo que sea y a veces por eso mismo, y eso será lo que busca y eso o algo como eso debe ser el anarquismo. Yo lo siento, pero no puedo decirlo bien...

Sombras contra el muro

Construído con elementos de timidez y de urgencia,
de pasión y de silencio;
a través de ganzúas y de ladrones hábiles,
acompañado de anarquistas perseguidos por la policía y de cómicos que morían sin éxito en los hospitales;
entre carpinteros de duras manos y tipógrafos de manos ágiles;
soñando en la cubierta de los vapores y en los vagones de carga de los trenes internacionales;
con muchos días de soledad y de cansancio,
sin lágrimas, con los zapatos destrozados,
por las calles de Santiago o de Buenos Aires...

Deshecha Rosa

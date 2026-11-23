# Factor Humano 2026

Sitio del evento de ciberseguridad **Factor Humano 2026**.
Jueves 26 de noviembre de 2026 · Centro Cultural de Lezama · con el acompañamiento de la Subsecretaría de Seguridad y Defensa Civil, Municipalidad de Lezama.

Sitio estático (HTML, CSS y JS), sin build. Se publica en Vercel desde la rama `main`.

## Estructura

```
index.html                     Sitio principal del evento (con el enlace a la inscripción)
credenciales.html              Credenciales para imprimir, con QR a cada página de rol
guia.html                      Página de la guía (descargar, ver y compartir) · /guia
cartel-guia.html               Cartel A4 con QR a /guia para el día del evento
investigador.html              Stand 2 "Rastro Digital": rastreo simulado (grafo) en 3 redes ficticias · /investigador
hacker.html                    Juego "Operación Lezama" (terminal de hacker ético) · /hacker
cuantica.html                  Computación cuántica explicada, con gráficos interactivos · /cuantica
estafa.html                    Stand 3 "¿Quién cae?": jugá de estafador o de víctima · /estafa
rol/
  invitados-especiales.html    Página que abre el QR de la credencial "Invitado especial"
  instituciones.html           …de "Institución"
  autoridades.html             …de "Autoridad"
  prensa.html                  …de "Prensa" (incluye gacetilla y contacto)
  staff.html                   …de "Staff" (reglas de oro del equipo y contacto)
assets/
  css/rol.css                  Estilos compartidos de las páginas de rol
  js/rol.js                    Ondas y programa "en vivo" (marca el bloque que está pasando)
  js/qrcode.js                 Generador de QR (qrcode-generator, MIT, Kazuhiko Arase)
  docs/Guia_de_Prevencion.pdf  Descargable para todos los roles
  docs/Gacetilla_de_prensa.pdf Descargable en la página de prensa
favicon.png · og.png · vercel.json
```

Con `cleanUrls` de Vercel, las páginas se abren sin `.html`: `/rol/prensa`, `/credenciales`.

## Imprimir las credenciales
1. Abrí `https://<tu-sitio>/credenciales` (desde el sitio publicado, así los QR apuntan a tu dominio).
2. Elegí cuántas querés de cada rol (4 por hoja A4).
3. Ctrl+P › A4 › Márgenes: Ninguno › Escala 100 % › Gráficos de fondo activado.
4. Recortá por las marcas: 6,8 × 10,8 cm (para portacredenciales de 7 × 11 cm).

## Inscripción
`index.html` ya tiene cargada la URL `/exec` del formulario de Apps Script en `INSCRIPCION_URL`.

## Cartel QR de la guía
Abrí `https://<tu-sitio>/cartel-guia` desde el sitio publicado e imprimilo (A4 o A3, márgenes: ninguno, gráficos de fondo). El QR lleva a `/guia`.

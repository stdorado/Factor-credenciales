# Factor Humano 2026 · contexto para Claude Code

Sitio del evento de ciberseguridad **Factor Humano 2026** que organiza Santino Dorado en Lezama (Buenos Aires).
Sitio estático: solo HTML, CSS y JS, sin build ni frameworks. Se publica en Vercel desde la rama `main`
(cada push a `main` se despliega solo, en un minuto).

## El evento
- Jueves 26 de noviembre de 2026, 18:00 h. Lugar: Av. Manuel José Cobo 241, Lezama
  (el nombre del lugar está por confirmar: "Centro Cultural de Lezama" o "Complejo Cultural General San Martín").
- Programa: 18:00 recepción y muestra · 18:30 conferencia (40 min) · 19:10 anuncio especial (20 min) · 19:30 preguntas y networking.
- Con el acompañamiento de la Subsecretaría de Seguridad y Defensa Civil, Municipalidad de Lezama.
- Presencial y transmisión en vivo (18:30 a 19:30).
- Contacto: confirmaciones.factorhumano2026@gmail.com · 2241 49-9954.
- Lema: "Lezama no se deja engañar". Regla de la charla: FRENÁ (Frená, Revisá, Elegí otro canal, Nunca compartas códigos, Avisá).
- Hashtags: #FactorHumanoLezama · #YoFreno.

## Reglas de contenido (importantes)
- **El anuncio de las 19:10 es sorpresa.** En todo lo público decir solo "anuncio especial para Lezama".
  No mencionar el sistema que se entrega al municipio, ni QR de emergencias, ni "COM".
- Santino habla siempre como **estudiante** (Seguridad Informática y de IA y Robótica, Universidad Siglo 21), nunca como ingeniero.
- Tono serio e institucional, cálido. Español rioplatense (vos). Sin rankings ni puntajes competitivos en lo público.
- Contenido de ciberseguridad siempre defensivo: nada de instrucciones de ataque.
- Tema violencia digital: protector, nunca explícito.
- Afirmaciones verificables: si un dato no está confirmado, no se inventa.

## Marca
- Colores: papel `#f3eee8`, tinta `#141010`, rojo `#d62b1f`, rojo claro `#ff4a36`.
- Tipografías: Inter Tight 800/900 (títulos), Inter (texto), JetBrains Mono (etiquetas en mayúsculas).
- Motivos: franja vertical a la izquierda, ondas de barras (más claras a la izquierda, acento a la derecha).
- Excepción: `rol/invitada-super-especial.html` (página de Delfina, sobrina de Santino, 7 años) tiene diseño propio, pastel, sin los colores del evento.

## Estructura
```
index.html                     Sitio principal (cuenta regresiva, temas, inscripción)
guia.html                      /guia · página de la guía de prevención (descargar, ver, compartir)
cartel-guia.html               Cartel A4 con QR a /guia (se imprime desde el sitio publicado)
investigador.html              /investigador · stand 2 "Rastro Digital": herramienta de rastreo simulada "FH-Trace" (grafo) + 3 redes ficticias
                               (Vecinal, Lente = solo fotos, Pío = mensajes cortos). 4 perfiles x 11 datos, editables en PROFILES;
                               los datos se marcan como [[clave|texto]] (también dentro de las fotos, en img.ovs).
hacker.html                    /hacker · juego "Operación Lezama": encendido de la compu (botón ON, BIOS, escritorio FH-OS) → terminal
                               de hacker ético, 5 misiones, credencial final con QR a /guia
estafa.html                    /estafa · stand 3 "¿Quién cae?": estafador (cinemática de llamada desde un celular descartable, escritorio
                               FH-OS, tarjetas, 30 s) o víctima (cinemática del celular en la mesa, chat, rebobinar).
                               Guiones editables en objetos JS al principio (CFG, TACTICS, VICTIMS, ALERTS, VSCRIPTS).
                               Todo ficticio (Banco Pampa, Correo Express Sur, Billetera Mía, app "Charlá"); no guarda nada.
cuantica.html                  /cuantica · explicación interactiva de computación cuántica (esfera de Bloch, medición, interferencia,
                               entrelazamiento, Grover, Shor, criptografía post-cuántica). Sin dependencias externas salvo fuentes.
credenciales.html              Credenciales 6,8 × 10,8 cm con QR a /rol/<rol>, 4 por hoja A4
rol/
  autoridades.html  invitados-especiales.html  instituciones.html  prensa.html
  staff.html  orador.html  invitada-super-especial.html
assets/css/rol.css             Estilos compartidos de las páginas de rol (temas t-ink, t-red, t-paper, t-especial)
assets/js/rol.js               Ondas y programa "en vivo" (marca el bloque actual en hora de Argentina)
assets/js/qrcode.js            qrcode-generator (MIT), se usa en credenciales y cartel
assets/js/kit.js + css/kit.css Kit de descargas de invitados y prensa: genera PNG en canvas (fondos, placas, logos, zócalos),
                               .ics, .zip y vista previa. Plantillas editables en el objeto T de kit.js.
assets/docs/                   Guia_de_Prevencion.pdf (8 páginas) y Gacetilla_de_prensa.pdf
vercel.json                    cleanUrls: las páginas se abren sin .html (/rol/prensa)
```

## Detalles técnicos
- `index.html` tiene `INSCRIPCION_URL` apuntando al formulario de Google Apps Script (`/exec`).
- Los QR de `credenciales.html` y `cartel-guia.html` se generan en el navegador con `location.origin`:
  imprimir siempre desde el sitio publicado, no desde un archivo local. Para pruebas: `?base=https://dominio`.
- Cantidades de credenciales (panel de `credenciales.html`): 40 Autoridad, 30 Invitado especial, 20 Institución,
  20 Prensa, 5 Staff, 1 Orador, 1 Invitada súper especial.
- Para probar en local: `python3 -m http.server 8000` y abrir `http://localhost:8000/rol/prensa.html`
  (en local hace falta el `.html`; en Vercel no).
- Todo tiene que verse bien en celular (390 px de ancho, sin scroll horizontal).

## Flujo de trabajo
1. Editar, probar en local.
2. `git add -A && git commit -m "..." && git push` a `main` → Vercel publica solo.

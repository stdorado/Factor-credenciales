/* FACTOR HUMANO 2026 · Kit de descargas de las páginas de rol
   Genera en el navegador (canvas) fondos de pantalla, placas, logos y recuerdos
   con la marca; arma el .zip del kit completo, el evento de calendario (.ics),
   textos para copiar y la vista previa con transición.
   Todo local: no se sube ni se guarda nada fuera del celular. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------ Marca
  var C = { paper: '#f3eee8', ink: '#141010', red: '#d62b1f', red2: '#ff4a36' };
  var TEMAS = {
    tinta: { nombre: 'Tinta', bg: C.ink, fg: C.paper, acc: C.red2, soft: '#cfc5be', line: 'rgba(243,238,232,.22)', stripe: C.red2 },
    rojo:  { nombre: 'Rojo',  bg: C.red, fg: '#ffffff', acc: C.ink, soft: '#fde3df', line: 'rgba(255,255,255,.35)', stripe: C.ink },
    papel: { nombre: 'Papel', bg: C.paper, fg: C.ink, acc: C.red, soft: '#4a403c', line: 'rgba(20,16,16,.2)', stripe: C.red }
  };
  var F_D = '"Inter Tight","Inter",system-ui,sans-serif';
  var F_B = '"Inter",system-ui,sans-serif';
  var F_M = '"JetBrains Mono",ui-monospace,monospace';

  var fuentes = null;
  function cargarFuentes() {
    if (fuentes) return fuentes;
    if (!document.fonts || !document.fonts.load) return (fuentes = Promise.resolve());
    fuentes = Promise.all([
      document.fonts.load('900 80px "Inter Tight"'), document.fonts.load('800 80px "Inter Tight"'),
      document.fonts.load('400 40px "Inter"'), document.fonts.load('600 40px "Inter"'),
      document.fonts.load('500 30px "JetBrains Mono"')
    ]).catch(function () {}).then(function () { return document.fonts.ready; });
    return fuentes;
  }

  // ------------------------------------------------------------ Primitivas de dibujo
  function fnt(ctx, peso, px, fam, track) {
    ctx.font = peso + ' ' + px + 'px ' + fam;
    if ('letterSpacing' in ctx) ctx.letterSpacing = (track || 0) * px + 'px';
  }
  var granoPat = null, sinGrano = false; // las descargas van sin grano: pesan mucho menos
  function grano(ctx, W, H, alfa) {
    if (!granoPat) {
      var g = document.createElement('canvas'); g.width = g.height = 160;
      var gc = g.getContext('2d'), d = gc.createImageData(160, 160);
      for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      gc.putImageData(d, 0, 0); granoPat = g;
    }
    ctx.save(); ctx.globalAlpha = alfa || 0.06; ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(granoPat, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  function base(ctx, W, H, th, sw) {
    ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
    if (!sinGrano) grano(ctx, W, H, th.bg === C.paper ? 0.10 : 0.07);
    ctx.fillStyle = th.stripe; ctx.fillRect(0, 0, sw || Math.round(W * 0.026), H);
  }
  function mono(ctx, txt, x, y, px, color, align) {
    fnt(ctx, 500, px, F_M, 0.16); ctx.fillStyle = color; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(String(txt).toUpperCase(), x, y); ctx.textAlign = 'left';
  }
  function rnd(seed) { var s = seed || 7; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  // Ondas de barras: más claras a la izquierda, acento a la derecha
  function ondas(ctx, x, y, w, h, n, seed, th, fg) {
    var r = rnd(seed), gap = Math.max(2, w / n * 0.22), bw = (w - gap * (n - 1)) / n;
    for (var i = 0; i < n; i++) {
      var u = i / n, env = Math.sin(Math.PI * u) * 0.8 + 0.2;
      var bh = Math.max(h * 0.08, (0.25 + 0.75 * r()) * env * h);
      ctx.globalAlpha = u < 0.55 ? 0.3 + 0.55 * u : 1;
      ctx.fillStyle = u < 0.55 ? (fg || th.fg) : th.acc;
      ctx.fillRect(x + i * (bw + gap), y + (h - bh) / 2, bw, bh);
    }
    ctx.globalAlpha = 1;
  }
  // Texto con *énfasis* en color de acento, con corte de línea
  function rico(ctx, str, x, y, o) {
    var px = o.px, lh = o.lh || 1.05, peso = o.peso || 900, fam = o.fam || F_D, maxW = o.maxW || 900;
    fnt(ctx, peso, px, fam, o.track == null ? -0.035 : o.track);
    ctx.textBaseline = 'alphabetic';
    var pal = [], em = false;
    String(str).split(' ').forEach(function (w) {
      if (!w) return;
      var abre = w.charAt(0) === '*', cierra = w.length > 1 && w.charAt(w.length - 1) === '*';
      if (abre) { em = true; w = w.slice(1); }
      if (cierra || (abre && w.charAt(w.length - 1) === '*')) { w = w.replace(/\*$/, ''); pal.push({ t: w, em: true }); em = false; return; }
      pal.push({ t: w, em: em });
    });
    var esp = ctx.measureText(' ').width, lineas = [[]], ancho = 0;
    pal.forEach(function (p) {
      var w = ctx.measureText(p.t).width;
      if (p.t === '\\n' || (lineas[lineas.length - 1].length && ancho + esp + w > maxW)) { lineas.push([]); ancho = 0; if (p.t === '\\n') return; }
      lineas[lineas.length - 1].push(p); ancho += (lineas[lineas.length - 1].length > 1 ? esp : 0) + w;
    });
    lineas.forEach(function (l, i) {
      var cx = x;
      if (o.align === 'center') { var tw = l.reduce(function (a, p, j) { return a + ctx.measureText(p.t).width + (j ? esp : 0); }, 0); cx = x - tw / 2; }
      l.forEach(function (p) { ctx.fillStyle = p.em ? (o.acc || '#f00') : (o.color || '#000'); ctx.fillText(p.t, cx, y + i * px * lh); cx += ctx.measureText(p.t).width + esp; });
    });
    return y + (lineas.length - 1) * px * lh;
  }
  function linea(ctx, x, y, w, alto, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, alto); }
  function marca(ctx, x, y, px, th, colorA) {
    fnt(ctx, 900, px, F_D, -0.055); ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = th.fg; ctx.fillText('Factor', x, y);
    ctx.fillStyle = colorA || th.acc; ctx.fillText('Humano.', x, y + px * 0.84);
  }
  function limpiar(s, n) { return String(s || '').replace(/\s+/g, ' ').trim().slice(0, n || 28); }

  // ------------------------------------------------------------ Plantillas
  var FRENA = [
    ['F', 'Frená', 'Si un mensaje te apura, esa es la señal para parar.'],
    ['R', 'Revisá', '¿Quién te escribe? ¿Adónde te lleva ese enlace?'],
    ['E', 'Elegí otro canal', 'Cortá y llamá vos al número de siempre.'],
    ['N', 'Nunca compartas códigos', 'Ni con el banco, ni con un organismo, ni con un amigo.'],
    ['Á', 'Avisá', 'Contale a alguien. Y si ya pasó, denunciá.']
  ];

  var T = {};

  // Fondo de pantalla con la regla FRENÁ
  T.fondoFrena = { W: 1080, H: 2340, draw: function (ctx, W, H, th) {
    base(ctx, W, H, th, 30);
    var x = 110;
    mono(ctx, 'Factor Humano 2026 · Lezama', x, 640, 30, th.acc);
    rico(ctx, 'Si te apura, *FRENÁ.*', x, 800, { px: 150, maxW: 900, color: th.fg, acc: th.acc, lh: 0.95 });
    var y = 1010;
    linea(ctx, x, y, W - x - 80, 5, th.fg);
    FRENA.forEach(function (f) {
      fnt(ctx, 900, 120, F_D, -0.03); ctx.fillStyle = th.acc; ctx.fillText(f[0], x, y + 130);
      fnt(ctx, 800, 58, F_D, -0.02); ctx.fillStyle = th.fg; ctx.fillText(f[1], x + 160, y + 82);
      rico(ctx, f[2], x + 160, y + 132, { px: 32, peso: 400, fam: F_B, track: 0, color: th.soft, maxW: W - x - 260, lh: 1.3 });
      y += 172; linea(ctx, x, y, W - x - 80, 3, th.line);
    });
    ondas(ctx, x, 1960, W - x - 80, 110, 48, 5, th);
    mono(ctx, '#YoFreno · Lezama no se deja engañar', x, 2150, 28, th.fg);
  } };

  // Fondo de pantalla con el lema
  T.fondoLema = { W: 1080, H: 2340, draw: function (ctx, W, H, th) {
    base(ctx, W, H, th, 30);
    var x = 110;
    ondas(ctx, x, 760, W - x - 60, 300, 40, 11, th);
    mono(ctx, '26.11.2026 · Lezama', x, 1240, 30, th.acc);
    rico(ctx, 'Lezama \\n no se deja \\n *engañar.*', x, 1430, { px: 178, maxW: 1000, color: th.fg, acc: th.acc, lh: 0.9, track: -0.05 });
    linea(ctx, x, 2010, W - x - 80, 5, th.fg);
    mono(ctx, 'Factor Humano 2026', x, 2080, 28, th.fg);
    mono(ctx, '#YoFreno', W - 80, 2080, 28, th.acc, 'right');
  } };

  // Historia "Yo estuve" (personalizable con el nombre)
  T.recuerdo = { W: 1080, H: 1920, nombre: true, draw: function (ctx, W, H, th, o) {
    base(ctx, W, H, th, 30);
    var x = 110, n = limpiar(o.nombre);
    linea(ctx, x, 250, W - x - 80, 5, th.fg);
    mono(ctx, 'Factor Humano 2026', x, 310, 28, th.fg); mono(ctx, 'Lezama', W - 80, 310, 28, th.acc, 'right');
    rico(ctx, n ? n + ' \\n *estuvo ahí.*' : 'Yo \\n *estuve ahí.*', x, 620, { px: 170, maxW: 900, color: th.fg, acc: th.acc, lh: 0.92, track: -0.05 });
    ondas(ctx, x, 1010, W - x - 80, 150, 44, 3, th);
    ctx.fillStyle = th.fg; ctx.fillRect(x, 1260, 360, 64); mono(ctx, 'Invitado especial', x + 24, 1303, 26, th.bg);
    rico(ctx, 'Jueves 26 de noviembre de 2026. *Una noche para cuidarnos entre todos.*', x, 1440, { px: 58, peso: 800, maxW: W - x - 100, color: th.fg, acc: th.acc, lh: 1.12, track: -0.02 });
    linea(ctx, x, 1720, W - x - 80, 3, th.line);
    mono(ctx, '#FactorHumanoLezama', x, 1790, 28, th.fg); mono(ctx, '#YoFreno', W - 80, 1790, 28, th.acc, 'right');
  } };

  // Postal con la frase de Santino para sus invitados
  T.postal = { W: 1080, H: 1350, draw: function (ctx, W, H, th) {
    base(ctx, W, H, th, 26);
    var x = 110;
    fnt(ctx, 900, 520, F_D, 0); ctx.fillStyle = th.acc; ctx.globalAlpha = 0.22; ctx.fillText('“', W - 330, 520); ctx.globalAlpha = 1;
    mono(ctx, 'De Santino, para vos', x, 230, 28, th.acc);
    rico(ctx, 'Esta charla habla del factor humano. Para mí, el factor humano *siempre fueron ustedes.*', x, 400, { px: 96, maxW: W - x - 90, color: th.fg, acc: th.acc, lh: 1.0, track: -0.04 });
    ondas(ctx, x, 1010, W - x - 80, 90, 44, 9, th);
    linea(ctx, x, 1150, W - x - 80, 4, th.fg);
    fnt(ctx, 800, 40, F_D, -0.01); ctx.fillStyle = th.fg; ctx.fillText('Santino Dorado', x, 1220);
    mono(ctx, 'Factor Humano 2026 · Lezama', x, 1270, 24, th.soft);
  } };

  // Tarjeta FRENÁ de bolsillo (85,6 × 54 mm a 300 ppp)
  T.bolsillo = { W: 1011, H: 638, draw: function (ctx, W, H, th) {
    base(ctx, W, H, th, 22);
    var x = 70;
    mono(ctx, 'Factor Humano 2026', x, 78, 20, th.acc); mono(ctx, '#YoFreno', W - 50, 78, 20, th.fg, 'right');
    rico(ctx, 'Si te apura, *FRENÁ.*', x, 168, { px: 74, color: th.fg, acc: th.acc, maxW: 900 });
    var y = 214; linea(ctx, x, y, W - x - 50, 4, th.fg);
    FRENA.forEach(function (f) {
      fnt(ctx, 900, 50, F_D, 0); ctx.fillStyle = th.acc; ctx.fillText(f[0], x, y + 66);
      fnt(ctx, 800, 30, F_D, -0.01); ctx.fillStyle = th.fg; ctx.fillText(f[1], x + 70, y + 46);
      fnt(ctx, 400, 21, F_B, 0); ctx.fillStyle = th.soft; ctx.fillText(f[2], x + 70, y + 72);
      y += 80; if (y < 600) linea(ctx, x, y, W - x - 50, 2, th.line);
    });
  } };

  // Pacto digital de la familia
  T.pacto = { W: 1080, H: 1350, draw: function (ctx, W, H, th) {
    base(ctx, W, H, th, 26);
    var x = 100;
    mono(ctx, 'Para pegar en la heladera', x, 150, 26, th.acc);
    rico(ctx, 'El pacto digital *de esta casa.*', x, 270, { px: 92, maxW: W - x - 80, color: th.fg, acc: th.acc, lh: 0.98 });
    var items = [
      'Tenemos una palabra clave. Si alguien pide plata urgente, se la preguntamos.',
      'Nadie comparte los códigos que llegan por SMS o WhatsApp. Nunca.',
      'Si un mensaje nos apura, cortamos y llamamos al número de siempre.',
      'Activamos la verificación en dos pasos en WhatsApp y en el correo.',
      'Si algo nos pasa, lo contamos sin vergüenza. Avisar protege a otros.'
    ];
    var y = 410; linea(ctx, x, y, W - x - 80, 4, th.fg);
    items.forEach(function (t) {
      ctx.strokeStyle = th.acc; ctx.lineWidth = 5; ctx.strokeRect(x, y + 38, 46, 46);
      var fin = rico(ctx, t, x + 80, y + 72, { px: 32, peso: 600, fam: F_B, track: -0.005, color: th.fg, maxW: W - x - 180, lh: 1.22 });
      y = Math.max(y + 120, fin + 32); linea(ctx, x, y, W - x - 80, 2, th.line);
    });
    mono(ctx, 'Firmamos:', x, 1210, 24, th.soft);
    ctx.setLineDash([8, 10]); ctx.strokeStyle = th.fg; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + 190, 1215); ctx.lineTo(W - 80, 1215); ctx.stroke(); ctx.setLineDash([]);
    mono(ctx, 'Factor Humano 2026 · Lezama no se deja engañar', x, 1290, 22, th.fg);
  } };

  // ---- Prensa
  T.logo = { W: 2000, H: 1000, transparente: true, draw: function (ctx, W, H, th) {
    var x = 180; ctx.fillStyle = th.acc; ctx.fillRect(x, 230, 46, 46);
    marca(ctx, x, 560, 360, th);
  } };

  T.banner = { W: 1920, H: 1080, draw: function (ctx, W, H, th) {
    base(ctx, W, H, th, 40);
    var x = 170;
    mono(ctx, 'Jornada de ciberseguridad · Lezama', x, 210, 34, th.acc);
    marca(ctx, x, 470, 250, th);
    rico(ctx, 'Los ataques de hoy empiezan *engañando a una persona.*', x, 800, { px: 64, peso: 800, maxW: 1100, color: th.fg, acc: th.acc, lh: 1.1, track: -0.02 });
    ondas(ctx, 1320, 300, 480, 380, 30, 3, th);
    linea(ctx, x, 950, W - x - 120, 5, th.fg);
    mono(ctx, 'Jueves 26.11.2026 · 18:00 h · Av. Manuel José Cobo 241', x, 1015, 28, th.fg);
    mono(ctx, '#FactorHumanoLezama', W - 120, 1015, 28, th.acc, 'right');
  } };

  T.envivo = { W: 1080, H: 1080, medio: true, draw: function (ctx, W, H, th, o) {
    base(ctx, W, H, th, 26);
    var x = 100, m = limpiar(o.medio, 32);
    ctx.fillStyle = th.acc; ctx.beginPath(); ctx.arc(x + 18, 150, 18, 0, 7); ctx.fill();
    mono(ctx, 'En vivo · 18:30 a 19:30', x + 56, 162, 32, th.fg);
    rico(ctx, 'Factor Humano *2026*', x, 360, { px: 130, maxW: W - x - 60, color: th.fg, acc: th.acc, lh: 0.92, track: -0.05 });
    rico(ctx, 'Conferencia y anuncio especial para Lezama, *en vivo.*', x, 660, { px: 54, peso: 800, maxW: W - x - 80, color: th.fg, acc: th.acc, lh: 1.12, track: -0.02 });
    ondas(ctx, x, 790, W - x - 80, 90, 44, 7, th);
    linea(ctx, x, 940, W - x - 80, 4, th.fg);
    mono(ctx, m ? 'Cobertura · ' + m : 'Jueves 26.11 · Lezama', x, 1000, 26, th.fg);
    mono(ctx, '#YoFreno', W - 80, 1000, 26, th.acc, 'right');
  } };

  T.cobertura = { W: 1080, H: 1920, medio: true, draw: function (ctx, W, H, th, o) {
    base(ctx, W, H, th, 30);
    var x = 110, m = limpiar(o.medio, 32);
    linea(ctx, x, 250, W - x - 80, 5, th.fg);
    mono(ctx, m ? 'Cobertura · ' + m : 'Cobertura especial', x, 310, 28, th.fg);
    mono(ctx, '26.11', W - 80, 310, 28, th.acc, 'right');
    marca(ctx, x, 620, 200, th);
    ondas(ctx, x, 900, W - x - 80, 160, 44, 13, th);
    rico(ctx, '“Los ataques de hoy empiezan *engañando a una persona.”*', x, 1260, { px: 76, peso: 900, maxW: W - x - 90, color: th.fg, acc: th.acc, lh: 1.02, track: -0.035 });
    linea(ctx, x, 1700, W - x - 80, 3, th.line);
    mono(ctx, 'Lezama · 18:30 h · En vivo', x, 1770, 28, th.fg);
    mono(ctx, '#FactorHumanoLezama', x, 1830, 26, th.acc);
  } };

  T.frenaPost = { W: 1080, H: 1350, draw: function (ctx, W, H, th) {
    base(ctx, W, H, th, 26);
    var x = 100;
    mono(ctx, 'La regla de Factor Humano 2026', x, 150, 26, th.acc);
    rico(ctx, 'Si te apura, *FRENÁ.*', x, 290, { px: 100, maxW: W - x - 30, color: th.fg, acc: th.acc });
    var y = 370; linea(ctx, x, y, W - x - 80, 5, th.fg);
    FRENA.forEach(function (f) {
      fnt(ctx, 900, 96, F_D, -0.03); ctx.fillStyle = th.acc; ctx.fillText(f[0], x, y + 118);
      fnt(ctx, 800, 50, F_D, -0.02); ctx.fillStyle = th.fg; ctx.fillText(f[1], x + 130, y + 72);
      fnt(ctx, 400, 30, F_B, 0); ctx.fillStyle = th.soft; ctx.fillText(f[2], x + 130, y + 118);
      y += 160; linea(ctx, x, y, W - x - 80, 3, th.line);
    });
    mono(ctx, 'Lezama no se deja engañar · #YoFreno', x, 1260, 24, th.fg);
  } };

  T.zocalo = { W: 1920, H: 1080, transparente: true, persona: true, draw: function (ctx, W, H, th, o) {
    var p = o.persona === 'evento'
      ? ['Factor Humano 2026', 'En vivo desde Lezama · #FactorHumanoLezama']
      : ['Santino Dorado', 'Estudiante de Seguridad Informática y de IA y Robótica · Universidad Siglo 21'];
    var x = 110, y = 820;
    fnt(ctx, 900, 64, F_D, -0.03); var w1 = ctx.measureText(p[0]).width;
    fnt(ctx, 500, 24, F_M, 0.12); var w2 = ctx.measureText(p[1].toUpperCase()).width;
    var w = Math.max(w1, w2) + 120;
    ctx.fillStyle = th.stripe; ctx.fillRect(x, y, 18, 160);
    ctx.fillStyle = th.bg; ctx.fillRect(x + 18, y, w, 104);
    ctx.fillStyle = th.fg; fnt(ctx, 900, 64, F_D, -0.03); ctx.fillText(p[0], x + 56, y + 76);
    ctx.fillStyle = th.fg; ctx.fillRect(x + 18, y + 104, w, 56);
    fnt(ctx, 500, 24, F_M, 0.12); ctx.fillStyle = th.bg; ctx.fillText(p[1].toUpperCase(), x + 56, y + 141);
    ondas(ctx, x + 18 + w - 200, y + 24, 160, 56, 16, 4, th);
  } };

  // ------------------------------------------------------------ Render y exportación
  function render(tpl, o, maxLado) {
    var t = T[tpl], s = maxLado ? Math.min(1, maxLado / Math.max(t.W, t.H)) : 1;
    var cv = document.createElement('canvas');
    cv.width = Math.round(t.W * s); cv.height = Math.round(t.H * s);
    var ctx = cv.getContext('2d'); ctx.scale(s, s);
    sinGrano = !maxLado; t.draw(ctx, t.W, t.H, TEMAS[o.tema] || TEMAS.tinta, o); sinGrano = false;
    return cv;
  }
  function aBlob(cv) { return new Promise(function (ok) { cv.toBlob(ok, 'image/png'); }); }
  function bajar(blob, nombre) {
    var u = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = u; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
  }
  function compartirArchivo(blob, nombre, texto) {
    try {
      var f = new File([blob], nombre, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [f] })) return navigator.share({ files: [f], text: texto || '' }).then(function () { return true; }, function () { return true; });
    } catch (e) {}
    return Promise.resolve(false);
  }

  // .ics del evento (hora de Argentina = UTC-3)
  function ics() {
    var txt = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Factor Humano 2026//Lezama//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT', 'UID:factorhumano2026-lezama@factorhumano', 'DTSTAMP:20261120T120000Z',
      'DTSTART:20261126T210000Z', 'DTEND:20261126T233000Z',
      'SUMMARY:Factor Humano 2026 · Lezama',
      'LOCATION:Av. Manuel José Cobo 241\\, Lezama\\, Buenos Aires',
      'DESCRIPTION:18:00 recepción y muestra · 18:30 conferencia · 19:10 anuncio especial para Lezama · 19:30 preguntas y networking. Lezama no se deja engañar. #FactorHumanoLezama',
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Factor Humano 2026 empieza en una hora', 'TRIGGER:-PT1H', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    return new Blob([txt], { type: 'text/calendar;charset=utf-8' });
  }

  // ------------------------------------------------------------ ZIP (sin compresión, para no depender de librerías)
  var CRC = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { var c = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(archivos) { // [{nombre, datos: Uint8Array}]
    var enc = new TextEncoder(), partes = [], central = [], off = 0;
    var d = new Date(), hora = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    var fecha = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    archivos.forEach(function (f) {
      var nom = enc.encode(f.nombre), dat = f.datos, crc = crc32(dat);
      var h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, hora, true); h.setUint16(12, fecha, true); h.setUint32(14, crc, true);
      h.setUint32(18, dat.length, true); h.setUint32(22, dat.length, true); h.setUint16(26, nom.length, true);
      partes.push(new Uint8Array(h.buffer), nom, dat);
      var c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
      c.setUint16(12, hora, true); c.setUint16(14, fecha, true); c.setUint32(16, crc, true);
      c.setUint32(20, dat.length, true); c.setUint32(24, dat.length, true); c.setUint16(28, nom.length, true); c.setUint32(42, off, true);
      central.push(new Uint8Array(c.buffer), nom);
      off += 30 + nom.length + dat.length;
    });
    var tam = central.reduce(function (a, b) { return a + b.length; }, 0);
    var e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, archivos.length, true); e.setUint16(10, archivos.length, true);
    e.setUint32(12, tam, true); e.setUint32(16, off, true);
    return new Blob(partes.concat(central, [new Uint8Array(e.buffer)]), { type: 'application/zip' });
  }
  function u8(blob) { return blob.arrayBuffer().then(function (b) { return new Uint8Array(b); }); }

  // ------------------------------------------------------------ UI: avisos, confeti, copiar
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'kt-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.innerHTML = '<b></b><span></span>'; toastEl.lastChild.textContent = msg;
    toastEl.classList.remove('on'); void toastEl.offsetWidth; toastEl.classList.add('on');
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
  }
  function confeti(origen) {
    if (reduce) return;
    var cv = document.createElement('canvas'), ctx = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
    cv.className = 'kt-confeti'; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; document.body.appendChild(cv); ctx.scale(dpr, dpr);
    var r = origen ? origen.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    var ox = r.left + r.width / 2, oy = r.top + r.height / 2, cols = [C.red2, C.red, C.paper, C.ink, '#ffffff'], ps = [];
    for (var i = 0; i < 120; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = 7 + Math.random() * 11;
      ps.push({ x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: 4 + Math.random() * 6, h: 8 + Math.random() * 22, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[i % cols.length] });
    }
    var t0 = performance.now();
    (function paso(t) {
      var k = (t - t0) / 1000; ctx.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach(function (p) {
        p.vy += 0.38; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.max(0, 1 - k / 2.4);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (k < 2.4) requestAnimationFrame(paso); else cv.remove();
    })(t0);
  }
  function copiar(txt, btn) {
    var ok = function () {
      toast('Copiado al portapapeles');
      if (btn) { btn.classList.add('ok'); setTimeout(function () { btn.classList.remove('ok'); }, 1800); }
      if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
    };
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(txt).then(ok, function () { viejo(); });
    viejo();
    function viejo() { var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) {} ta.remove(); }
  }
  // Botones [data-copiar="id"] copian el texto del elemento con ese id
  function enlazarCopiar(raiz) {
    (raiz || document).querySelectorAll('[data-copiar]').forEach(function (b) {
      b.addEventListener('click', function () {
        var el = document.getElementById(b.dataset.copiar);
        copiar(el ? (el.value || el.innerText).trim() : b.dataset.copiar, b);
      });
    });
  }

  // ------------------------------------------------------------ Kit: grilla + vista previa
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function montar(cfg) {
    var grilla = document.querySelector(cfg.grilla);
    if (!grilla) return;
    var estado = cfg.estado || {};
    var items = cfg.items;

    items.forEach(function (it, i) {
      it.tema = it.tema || (it.temas ? it.temas[0] : 'tinta');
      it.persona = it.persona || 'santino';
      var a = document.createElement('button');
      a.type = 'button'; a.className = 'kt-card' + (it.ancho ? ' ancho' : ''); a.style.setProperty('--i', i);
      var tam = it.tpl ? T[it.tpl].W + '×' + T[it.tpl].H : (it.peso || '');
      a.innerHTML = '<span class="kt-thumb' + (it.tpl && T[it.tpl].transparente ? ' trans' : '') + '">' +
        (it.tpl ? '' : '<span class="kt-doc"><b>' + esc(it.fmt) + '</b><i></i><i></i><i></i></span>') +
        '</span><span class="kt-meta"><span class="mono">' + esc(it.fmt) + (tam ? ' · ' + esc(tam) : '') + '</span><strong>' + esc(it.titulo) + '</strong><small>' + esc(it.desc) + '</small></span>' +
        '<span class="kt-go" aria-hidden="true">↓</span>';
      a.setAttribute('aria-label', it.titulo + '. ' + it.desc + '. Abrir para descargar');
      it.card = a; it.thumb = a.querySelector('.kt-thumb');
      a.addEventListener('click', function () { abrir(it); });
      inclinar(a);
      grilla.appendChild(a);
    });

    // Miniaturas (cuando se cargan las fuentes)
    cargarFuentes().then(function () { items.forEach(miniatura); });
    function miniatura(it) {
      if (!it.tpl) return;
      var cv = render(it.tpl, opciones(it), 520);
      cv.className = 'kt-cv'; it.thumb.innerHTML = ''; it.thumb.appendChild(cv);
    }
    function opciones(it) { return { tema: it.tema, nombre: estado.nombre, medio: estado.medio, persona: it.persona }; }
    cfg.refrescar = function () { items.forEach(function (it) { if (it.tpl && (T[it.tpl].nombre || T[it.tpl].medio)) miniatura(it); }); };

    // Entrada escalonada al hacer scroll
    if (!reduce && 'IntersectionObserver' in window) {
      grilla.classList.add('kt-oculta');
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { grilla.classList.add('kt-in'); io.disconnect(); } }); }, { threshold: 0.08 });
      io.observe(grilla);
    }

    // ---- Vista previa
    var modal = document.createElement('div');
    modal.className = 'kt-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'kt-tit'); modal.hidden = true;
    modal.innerHTML = '<div class="kt-velo"></div><div class="kt-hoja">' +
      '<div class="kt-asa" aria-hidden="true"></div>' +
      '<button class="kt-x" type="button" aria-label="Cerrar">×</button>' +
      '<div class="kt-prev"></div>' +
      '<div class="kt-info"><span class="mono kt-fmt"></span><h3 id="kt-tit"></h3><p class="kt-desc"></p>' +
      '<div class="kt-opts"></div>' +
      '<div class="kt-acc"><button type="button" class="btn kt-bajar">Descargar <span class="mono">Guardar</span></button>' +
      '<button type="button" class="btn ghost kt-comp">Compartir <span class="mono">Enviar</span></button></div></div></div>';
    document.body.appendChild(modal);
    var prev = modal.querySelector('.kt-prev'), opts = modal.querySelector('.kt-opts'), hoja = modal.querySelector('.kt-hoja');
    var actual = null, ultimoFoco = null;

    function pintarPrev() {
      var it = actual; prev.innerHTML = '';
      prev.classList.toggle('trans', !!(it.tpl && T[it.tpl].transparente));
      if (it.tpl) {
        var cv = render(it.tpl, opciones(it), 1200); cv.className = 'kt-cv'; prev.appendChild(cv);
      } else {
        prev.innerHTML = '<span class="kt-doc grande"><b>' + esc(it.fmt) + '</b><i></i><i></i><i></i><i></i></span>';
      }
    }
    function abrir(it) {
      actual = it; ultimoFoco = document.activeElement;
      modal.querySelector('.kt-fmt').textContent = it.fmt + (it.tpl ? ' · ' + T[it.tpl].W + '×' + T[it.tpl].H + ' px' : (it.peso ? ' · ' + it.peso : ''));
      modal.querySelector('#kt-tit').textContent = it.titulo;
      modal.querySelector('.kt-desc').textContent = it.largo || it.desc;
      opts.innerHTML = '';
      if (it.temas && it.temas.length > 1) {
        var g = document.createElement('div'); g.className = 'kt-chips'; g.setAttribute('role', 'radiogroup'); g.setAttribute('aria-label', 'Color');
        it.temas.forEach(function (tn) {
          var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio');
          b.className = 'kt-chip'; b.style.setProperty('--sw', TEMAS[tn].bg); b.style.setProperty('--sw2', TEMAS[tn].acc);
          b.innerHTML = '<i></i>' + TEMAS[tn].nombre; b.setAttribute('aria-checked', String(tn === it.tema));
          b.addEventListener('click', function () {
            it.tema = tn; g.querySelectorAll('.kt-chip').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
            transicionPrev(); miniatura(it);
          });
          g.appendChild(b);
        });
        opts.appendChild(g);
      }
      if (it.tpl && T[it.tpl].persona) {
        var g2 = document.createElement('div'); g2.className = 'kt-chips';
        [['santino', 'Orador'], ['evento', 'Evento']].forEach(function (p) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'kt-chip'; b.innerHTML = '<i></i>' + p[1];
          b.setAttribute('aria-checked', String(it.persona === p[0])); b.setAttribute('role', 'radio');
          b.addEventListener('click', function () { it.persona = p[0]; g2.querySelectorAll('.kt-chip').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); }); transicionPrev(); miniatura(it); });
          g2.appendChild(b);
        });
        opts.appendChild(g2);
      }
      var campo = it.tpl && T[it.tpl].nombre ? ['nombre', 'Tu nombre (opcional)', 'Ej.: Juli'] : it.tpl && T[it.tpl].medio ? ['medio', 'Nombre del medio (opcional)', 'Ej.: Radio Lezama'] : null;
      if (campo) {
        var l = document.createElement('label'); l.className = 'kt-campo';
        l.innerHTML = '<span class="mono">' + campo[1] + '</span><input type="text" maxlength="28" autocomplete="off" placeholder="' + campo[2] + '">';
        var inp = l.querySelector('input'); inp.value = estado[campo[0]] || '';
        inp.addEventListener('input', function () { estado[campo[0]] = inp.value; if (cfg.alCambiar) cfg.alCambiar(campo[0], inp.value); pintarPrev(); miniatura(it); });
        opts.appendChild(l);
      }
      modal.querySelector('.kt-comp').hidden = !(navigator.share && it.tpl);
      pintarPrev();
      modal.hidden = false; document.documentElement.classList.add('kt-abierto');
      // Transición: la miniatura vuela hasta la vista previa
      var desde = it.thumb.getBoundingClientRect();
      requestAnimationFrame(function () {
        modal.classList.add('on');
        var hasta = prev.getBoundingClientRect();
        if (!reduce && prev.animate && hasta.width) {
          var sx = desde.width / hasta.width, sy = desde.height / hasta.height;
          prev.animate([
            { transform: 'translate(' + (desde.left - hasta.left) + 'px,' + (desde.top - hasta.top) + 'px) scale(' + sx + ',' + sy + ')', transformOrigin: '0 0', borderRadius: '0' },
            { transform: 'none', transformOrigin: '0 0' }
          ], { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)' });
        }
        modal.querySelector('.kt-x').focus({ preventScroll: true });
      });
    }
    function transicionPrev() {
      if (reduce || !prev.animate) return pintarPrev();
      prev.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96) rotate(-.6deg)' }], { duration: 160, easing: 'ease-in' }).onfinish = function () {
        pintarPrev(); prev.animate([{ opacity: 0, transform: 'scale(1.03)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
      };
    }
    function cerrar() {
      if (modal.hidden) return;
      modal.classList.remove('on'); document.documentElement.classList.remove('kt-abierto');
      setTimeout(function () { modal.hidden = true; }, reduce ? 0 : 380);
      if (ultimoFoco) ultimoFoco.focus({ preventScroll: true });
    }
    modal.querySelector('.kt-velo').addEventListener('click', cerrar);
    modal.querySelector('.kt-x').addEventListener('click', cerrar);
    addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
    // Deslizar hacia abajo para cerrar
    var y0 = null;
    hoja.addEventListener('touchstart', function (e) { if (hoja.scrollTop <= 0) y0 = e.touches[0].clientY; }, { passive: true });
    hoja.addEventListener('touchmove', function (e) { if (y0 == null) return; var dy = e.touches[0].clientY - y0; if (dy > 0) hoja.style.transform = 'translateY(' + dy + 'px)'; }, { passive: true });
    hoja.addEventListener('touchend', function (e) {
      if (y0 == null) return; var dy = e.changedTouches[0].clientY - y0; y0 = null; hoja.style.transform = '';
      if (dy > 120) cerrar();
    });

    function nombreArchivo(it) { return it.archivo + (it.temas && it.temas.length > 1 ? '_' + it.tema : '') + (it.tpl && T[it.tpl].persona ? '_' + it.persona : '') + '.' + it.ext; }
    function blobDe(it) {
      if (it.tpl) return cargarFuentes().then(function () { return aBlob(render(it.tpl, opciones(it))); });
      if (it.generar) return Promise.resolve(it.generar());
      if (it.texto) return Promise.resolve(new Blob([it.texto()], { type: 'text/plain;charset=utf-8' }));
      return fetch(it.href).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); });
    }
    function descargar(it, btn) {
      if (it.href && !it.tpl) { var a = document.createElement('a'); a.href = it.href; a.download = it.archivo + '.' + it.ext; document.body.appendChild(a); a.click(); a.remove(); listo(btn); return; }
      btn && btn.classList.add('cargando');
      blobDe(it).then(function (b) { bajar(b, nombreArchivo(it)); listo(btn); }).catch(function () { toast('No se pudo generar. Probá de nuevo.'); })
        .then(function () { btn && btn.classList.remove('cargando'); });
    }
    function listo(btn) { toast('Listo: se está descargando'); confeti(btn); if (navigator.vibrate) try { navigator.vibrate([20, 40, 20]); } catch (e) {} }
    modal.querySelector('.kt-bajar').addEventListener('click', function () { descargar(actual, this); });
    modal.querySelector('.kt-comp').addEventListener('click', function () {
      var it = actual, b = this;
      blobDe(it).then(function (bl) { return compartirArchivo(bl, nombreArchivo(it), cfg.textoCompartir || '#FactorHumanoLezama #YoFreno'); })
        .then(function (ok) { if (!ok) descargar(it, b); });
    });

    // ---- Descargar todo en un .zip
    var btnZip = cfg.zip && document.querySelector(cfg.zip);
    if (btnZip) btnZip.addEventListener('click', function () {
      if (btnZip.classList.contains('cargando')) return;
      btnZip.classList.add('cargando'); btnZip.style.setProperty('--pz', '0');
      var lista = [];
      items.forEach(function (it) {
        if (it.tpl && it.temas && it.temas.length > 1 && cfg.zipTodosLosColores) it.temas.forEach(function (tn) { lista.push({ it: it, tema: tn }); });
        else lista.push({ it: it, tema: it.tema });
      });
      (cfg.extrasZip || []).forEach(function (x) { lista.push({ it: x, tema: x.tema }); });
      var out = [], hechos = 0, carpeta = cfg.carpeta || 'Factor_Humano_2026';
      cargarFuentes().then(function () {
        return lista.reduce(function (p, x) {
          return p.then(function () {
            var guard = x.it.tema; x.it.tema = x.tema || guard;
            var nom = nombreArchivo(x.it);
            return blobDe(x.it).then(u8).then(function (d) { out.push({ nombre: carpeta + '/' + (x.it.carpeta ? x.it.carpeta + '/' : '') + nom, datos: d }); })
              .catch(function () {}).then(function () {
                x.it.tema = guard; hechos++; btnZip.style.setProperty('--pz', (hechos / lista.length).toFixed(3));
                return new Promise(function (ok) { setTimeout(ok, 30); });
              });
          });
        }, Promise.resolve());
      }).then(function () {
        if (!out.length) throw new Error('vacío');
        bajar(zip(out), carpeta + '.zip');
        toast(out.length + ' archivos en tu kit'); confeti(btnZip);
      }).catch(function () { toast('No se pudo armar el .zip. Bajá los archivos de a uno.'); })
        .then(function () { setTimeout(function () { btnZip.classList.remove('cargando'); }, 400); });
    });

    return cfg;
  }

  // Leve inclinación 3D al pasar el dedo o el mouse
  function inclinar(el) {
    if (reduce) return;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg'); el.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
      el.style.setProperty('--lx', ((x + 0.5) * 100).toFixed(1) + '%'); el.style.setProperty('--ly', ((y + 0.5) * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  }

  // Números que cuentan desde cero al aparecer
  function contadores(sel) {
    var els = document.querySelectorAll(sel);
    if (!els.length) return;
    function correr(el) {
      var fin = parseFloat(el.dataset.n), t0 = null, dur = 1400;
      if (reduce) { el.textContent = fin; return; }
      (function paso(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(paso); })(performance.now());
    }
    if (!('IntersectionObserver' in window)) return els.forEach(correr);
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { correr(e.target); io.unobserve(e.target); } }); }, { threshold: 0.5 });
    els.forEach(function (el) { el.textContent = '0'; io.observe(el); });
  }

  window.FHKit = {
    temas: TEMAS, plantillas: T, render: render, cargarFuentes: cargarFuentes, ics: ics, zip: zip,
    bajar: bajar, toast: toast, confeti: confeti, copiar: copiar, enlazarCopiar: enlazarCopiar,
    montar: montar, inclinar: inclinar, contadores: contadores
  };
})();

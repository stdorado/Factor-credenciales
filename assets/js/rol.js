/* FACTOR HUMANO 2026 · Comportamiento de las páginas de credencial
   - Dibuja el motivo de ondas (un toque las agita).
   - Marca en el programa qué bloque está pasando ahora (hora de Argentina).
   - Cuenta regresiva, revelado al hacer scroll, etiquetas que se "decodifican",
     halo que sigue al dedo, progreso de lectura en la franja y cinta con el lema. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino = window.matchMedia && matchMedia('(pointer: fine)').matches;
  var DIA = '2026-11-26', TZ = '-03:00';
  function t(hhmm) { return new Date(DIA + 'T' + hhmm + ':00' + TZ).getTime(); }
  function pad(n) { return String(n).padStart(2, '0'); }

  // ---------- Ondas ----------
  document.querySelectorAll('.wave').forEach(function (w) {
    var n = 56, s = Number(w.dataset.seed || 7);
    function r() { s = (s * 16807) % 2147483647; return s / 2147483647; }
    for (var i = 0; i < n; i++) {
      var u = i / n, env = Math.sin(Math.PI * u) * 0.8 + 0.2;
      var b = document.createElement('span');
      b.style.height = Math.max(6, Math.round((0.25 + 0.75 * r()) * env * 64)) + 'px';
      b.style.opacity = u < 0.55 ? (0.3 + 0.55 * u).toFixed(2) : '1';
      b.style.animationDelay = (-(i % 13) * 0.2).toFixed(1) + 's';
      if (u >= 0.55) b.className = 'a';
      w.appendChild(b);
    }
    var to;
    w.addEventListener('click', function () {
      w.classList.add('boost'); clearTimeout(to);
      to = setTimeout(function () { w.classList.remove('boost'); }, 1600);
      if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) {}
    });
  });

  // ---------- Elementos decorativos ----------
  var stripe = document.querySelector('.stripe'), barra = null;
  if (stripe) { barra = document.createElement('i'); stripe.appendChild(barra); }
  var glow = document.createElement('div');
  glow.className = 'glow'; glow.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(glow, document.body.firstChild);

  var footer = document.querySelector('.wrap > footer');
  if (footer) {
    var frase = '<span>Lezama no se deja engañar<i>✦</i></span><span>#YoFreno<i>✦</i></span><span>#FactorHumanoLezama<i>✦</i></span>';
    var m = document.createElement('div');
    m.className = 'marq'; m.setAttribute('aria-hidden', 'true');
    m.innerHTML = '<div>' + frase + frase + frase + frase + '</div>';
    footer.parentNode.insertBefore(m, footer);
  }

  // ---------- Cuenta regresiva en la portada ----------
  var cd = null, cdN = [];
  var ola = document.querySelector('.hero .wave');
  if (ola && document.querySelector('.prog') && Date.now() < t('18:00')) {
    cd = document.createElement('div');
    cd.className = 'cd'; cd.setAttribute('role', 'timer'); cd.setAttribute('aria-label', 'Cuenta regresiva al evento');
    cd.innerHTML = ['Días', 'Horas', 'Min', 'Seg'].map(function (l) { return '<div><b>--</b><span class="mono">' + l + '</span></div>'; }).join('');
    ola.parentNode.insertBefore(cd, ola.nextSibling);
    cdN = Array.prototype.slice.call(cd.querySelectorAll('b'));
  }
  function cuenta() {
    if (!cd) return;
    var diff = t('18:00') - Date.now();
    if (diff <= 0) { cd.remove(); cd = null; return; }
    var sec = Math.floor(diff / 1000), min = Math.floor(sec / 60);
    [Math.floor(min / 1440), Math.floor((min % 1440) / 60), min % 60, sec % 60].forEach(function (v, i) {
      var txt = pad(v), el = cdN[i];
      if (el.textContent !== txt) {
        el.textContent = txt;
        if (!reduce) { el.classList.remove('tic'); void el.offsetWidth; el.classList.add('tic'); }
      }
    });
  }
  cuenta(); setInterval(cuenta, 1000);

  // ---------- Programa en vivo ----------
  var items = Array.prototype.slice.call(document.querySelectorAll('.prog li[data-desde]'));
  var estado = document.getElementById('estado');
  items.forEach(function (li) { var b = document.createElement('i'); b.className = 'bar'; b.setAttribute('aria-hidden', 'true'); li.appendChild(b); });

  function actualizar() {
    var ahora = Date.now();
    var inicio = t('18:00'), fin = t('20:30');
    items.forEach(function (li) {
      var a = t(li.dataset.desde), b = t(li.dataset.hasta), now = ahora >= a && ahora < b;
      li.classList.toggle('now', now);
      li.classList.toggle('past', ahora >= b);
      li.style.setProperty('--pct', now ? ((ahora - a) / (b - a) * 100).toFixed(1) + '%' : '0%');
    });
    if (!estado) return;
    var msg = '';
    if (ahora < inicio) {
      var dias = Math.ceil((t('00:00') - ahora) / 864e5);
      msg = dias > 1 ? 'Faltan ' + dias + ' días'
          : dias === 1 ? 'Es mañana, desde las 18:00 h'
          : 'Es hoy · La recepción abre a las 18:00 h';
    } else if (ahora >= fin) {
      msg = 'Gracias por haber sido parte de Factor Humano 2026';
    }
    estado.textContent = msg;
    estado.classList.toggle('on', !!msg);
  }
  actualizar();
  setInterval(actualizar, 30000);

  // ---------- Etiquetas que se "decodifican" ----------
  var GLIFOS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+/<>';
  function decodificar(el) {
    if (reduce || el.dataset.dec) return;
    var final = el.textContent; el.dataset.dec = '1';
    el.setAttribute('aria-label', final);
    var frames = 0, total = 18;
    (function paso() {
      frames++;
      var hasta = Math.floor(final.length * frames / total);
      el.textContent = final.split('').map(function (c, i) {
        return i < hasta || c === ' ' ? c : GLIFOS[(Math.random() * GLIFOS.length) | 0];
      }).join('');
      if (frames < total) requestAnimationFrame(function () { setTimeout(paso, 28); });
      else el.textContent = final;
    })();
  }

  // ---------- Revelado al hacer scroll ----------
  var sel = 'main section .eb, main section h2, main section .p, main section .rows, main section .prog, main section .facts, main section .card, main section .btn, main section .thanks, .wrap > footer';
  var objetivos = Array.prototype.slice.call(document.querySelectorAll(sel));
  if (!reduce && 'IntersectionObserver' in window) {
    objetivos.forEach(function (el) {
      el.classList.add('rv');
      var hijos = el.matches('.rows, .prog') ? el.children : [];
      Array.prototype.forEach.call(hijos, function (c, i) { c.style.setProperty('--d', (0.15 + i * 0.09).toFixed(2) + 's'); });
    });
    // Los botones de una misma lista entran escalonados
    document.querySelectorAll('main section .btns').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (b, i) { b.style.setProperty('--d', (i * 0.1).toFixed(2) + 's'); });
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target.classList.contains('eb')) decodificar(e.target);
        // Terminado el revelado, los botones vuelven a sus transiciones rápidas de hover
        if (e.target.classList.contains('btn')) { var el = e.target; setTimeout(function () { el.classList.remove('rv', 'in'); }, 1300); }
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    objetivos.forEach(function (el) { io.observe(el); });
  }
  // La etiqueta de la portada también se decodifica, después del telón
  var chip = document.querySelector('.chip');
  if (chip && !reduce) {
    var nodo = Array.prototype.find.call(chip.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
    if (nodo) {
      var sp = document.createElement('span'); sp.textContent = nodo.textContent; chip.replaceChild(sp, nodo);
      setTimeout(function () { decodificar(sp); }, 800);
    }
  }

  // ---------- Halo, progreso de lectura y luz sobre la tarjeta ----------
  var tick = false;
  function scroll() {
    if (tick) return; tick = true;
    requestAnimationFrame(function () {
      tick = false;
      var h = document.documentElement.scrollHeight - innerHeight;
      var p = h > 0 ? Math.min(1, scrollY / h) : 0;
      if (barra) barra.style.setProperty('--p', p.toFixed(4));
      if (!fino) {
        glow.style.setProperty('--gx', (70 - 40 * Math.sin(p * Math.PI)) + 'vw');
        glow.style.setProperty('--gy', (18 + 60 * p) + 'vh');
      }
    });
  }
  addEventListener('scroll', scroll, { passive: true }); scroll();
  if (fino && !reduce) {
    addEventListener('pointermove', function (e) {
      glow.style.setProperty('--gx', e.clientX + 'px');
      glow.style.setProperty('--gy', e.clientY + 'px');
    }, { passive: true });
  }
  document.querySelectorAll('.thanks').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();

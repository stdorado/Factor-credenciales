/* FACTOR HUMANO 2026 · Comportamiento de las páginas de credencial
   - Dibuja el motivo de ondas.
   - Marca en el programa qué bloque está pasando ahora (hora de Argentina). */
(function () {
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
  });

  // ---------- Programa en vivo ----------
  var DIA = '2026-11-26', TZ = '-03:00';
  var items = Array.prototype.slice.call(document.querySelectorAll('.prog li[data-desde]'));
  var estado = document.getElementById('estado');
  function t(hhmm) { return new Date(DIA + 'T' + hhmm + ':00' + TZ).getTime(); }

  function actualizar() {
    var ahora = Date.now();
    var inicio = t('18:00'), fin = t('20:30');
    items.forEach(function (li) {
      var a = t(li.dataset.desde), b = t(li.dataset.hasta);
      li.classList.toggle('now', ahora >= a && ahora < b);
      li.classList.toggle('past', ahora >= b);
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
})();

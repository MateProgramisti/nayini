(function () {
  var yes = document.getElementById('yes');
  var no = document.getElementById('no');
  var hint = document.getElementById('hint');
  var attempts = 0;
  var lastDodge = 0;
  var tx = 0, ty = 0;
  var pointer = { x: -1000, y: -1000 };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var hints = [
    '',
    'ვიცი რომ გინდა',
    'ვერ დაიჭერ 🙈',
    'იქნებ „კი“ სცადო?',
    'უარს ვერავინ იტყვის 😌',
    'რაიცი რა მოხდება 👀',
    'გემრიელი ნაყინია 🍨'
  ];

  function currentTranslateX() {
    var m = new DOMMatrix(getComputedStyle(no).transform);
    return m.m41;
  }
  function currentTranslateY() {
    var m = new DOMMatrix(getComputedStyle(no).transform);
    return m.m42;
  }

  function overlaps(a, b, gap) {
    return !(a.right + gap < b.left || a.left - gap > b.right || a.bottom + gap < b.top || a.top - gap > b.bottom);
  }

  function dodge() {
    var now = Date.now();
    if (now - lastDodge < 120) return;
    lastDodge = now;

    var pad = 12;
    var vw = window.innerWidth, vh = window.innerHeight;
    var r = no.getBoundingClientRect();
    var w = r.width, h = r.height;
    var baseLeft = r.left - currentTranslateX();
    var baseTop = r.top - currentTranslateY();
    var yr = yes.getBoundingClientRect();

    var best = null, bestScore = -1;
    for (var i = 0; i < 40; i++) {
      var x = pad + Math.random() * Math.max(1, vw - w - 2 * pad);
      var y = pad + Math.random() * Math.max(1, vh - h - 2 * pad);
      var cx = x + w / 2, cy = y + h / 2;
      var d = Math.hypot(cx - pointer.x, cy - pointer.y);
      var box = { left: x, top: y, right: x + w, bottom: y + h };
      if (overlaps(box, yr, 16)) d *= 0.2;
      if (d > bestScore) { bestScore = d; best = { x: x, y: y }; }
    }

    tx = best.x - baseLeft;
    ty = best.y - baseTop;
    no.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';

    attempts++;
    var s = Math.min(1 + attempts * 0.07, 1.5);
    yes.style.setProperty('--s', s);
    hint.textContent = hints[Math.min(attempts, hints.length - 1)];
  }

  document.addEventListener('pointermove', function (e) {
    pointer.x = e.clientX; pointer.y = e.clientY;
    var r = no.getBoundingClientRect();
    var near = 80;
    if (e.clientX > r.left - near && e.clientX < r.right + near &&
        e.clientY > r.top - near && e.clientY < r.bottom + near) {
      dodge();
    }
  });
  no.addEventListener('pointerenter', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; dodge(); });
  no.addEventListener('pointerdown', function (e) { e.preventDefault(); pointer.x = e.clientX; pointer.y = e.clientY; dodge(); });
  no.addEventListener('touchstart', function (e) { e.preventDefault(); dodge(); }, { passive: false });
  no.addEventListener('focus', function () { pointer.x = -1000; pointer.y = -1000; dodge(); });
  no.addEventListener('click', function (e) { e.preventDefault(); dodge(); });

  window.addEventListener('resize', function () {
    tx = 0; ty = 0;
    no.style.transform = '';
  });

  yes.addEventListener('click', function () {
    document.body.classList.add('accepted');
    if (reduced) return;
    var bits = ['🍦', '🍓', '🍨', '💗', '🍒', '✨'];
    for (var i = 0; i < 60; i++) {
      var el = document.createElement('span');
      el.className = 'bit';
      el.textContent = bits[Math.floor(Math.random() * bits.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.animationDuration = (2.5 + Math.random() * 2.5) + 's';
      el.style.animationDelay = (Math.random() * 1.2) + 's';
      el.style.fontSize = (1.2 + Math.random() * 1.6) + 'rem';
      document.body.appendChild(el);
      setTimeout(function (n) { return function () { n.remove(); }; }(el), 7000);
    }
  });
})();

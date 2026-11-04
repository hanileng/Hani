(function(){
  var toggle = document.getElementById('menuToggle'), menu = document.getElementById('navMenu');
  toggle.addEventListener('click', function(){
    var o = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', o);
  });
  menu.addEventListener('click', function(e){
    if(e.target.closest('a')){
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  var links = [].slice.call(document.querySelectorAll('#navMenu a')),
      views = [].slice.call(document.querySelectorAll('[data-view]')),
      names = links.map(function(a){ return a.getAttribute('href').slice(1); });
  function show(){
    var h = location.hash.slice(1);
    if(names.indexOf(h) < 0) h = 'home';
    views.forEach(function(v){ v.classList.toggle('on', v.dataset.view === h); });
    links.forEach(function(a, i){
      if(names[i] === h) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
    enter(h);
  }
  window.addEventListener('hashchange', show);

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // stagger index + count-up
  var run = 0;
  function enter(h){
    views.forEach(function(sec){
      if(sec.dataset.view !== h) return;
      sec.querySelectorAll('.grid>.card,.skills>.skill,.timeline>li,.socials>.social,.stats>.stat,.split>*,.hero-grid>*').forEach(function(el, i){ el.style.setProperty('--i', i); });
    });
    if(h === 'home') countUp();
  }
  function countUp(){
    if(reduce) return;
    var id = ++run;
    document.querySelectorAll('.stat b').forEach(function(b){
      if(!b.dataset.t) b.dataset.t = b.textContent;
      var t = b.dataset.t, m = t.match(/[\d.]+/);
      if(!m) return;
      var n = parseFloat(m[0]), dec = (m[0].split('.')[1] || '').length, start = null;
      function f(ts){
        if(id !== run) return;
        if(!start) start = ts;
        var k = Math.min((ts - start) / 900, 1), e = 1 - Math.pow(1 - k, 3);
        b.textContent = t.replace(m[0], (n * e).toFixed(dec));
        if(k < 1) requestAnimationFrame(f); else b.textContent = t;
      }
      requestAnimationFrame(f);
    });
  }

  // rotating focus line
  var rot = document.getElementById('rot'),
      words = ['fast response times', '5-star guest reviews', 'zero-delay turnarounds', 'calm, clear communication'], wi = 0;
  if(rot && !reduce){
    setInterval(function(){
      rot.classList.add('out');
      setTimeout(function(){ wi = (wi + 1) % words.length; rot.textContent = words[wi]; rot.classList.remove('out'); }, 260);
    }, 2800);
  }

  // hero parallax
  var hero = document.getElementById('home'), col = hero.querySelector('.collage');
  if(!reduce && col){
    hero.addEventListener('mousemove', function(e){
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      col.style.setProperty('--mx', (x * 20) + 'px'); col.style.setProperty('--my', (y * 14) + 'px');
    });
    hero.addEventListener('mouseleave', function(){ col.style.setProperty('--mx', '0px'); col.style.setProperty('--my', '0px'); });
  }

  // achievements filter
  var grid = document.querySelector('#achievements .grid'), cards = [].slice.call(grid.children), cats = [];
  cards.forEach(function(c){ var t = c.querySelector('.tag').textContent; c.dataset.cat = t; if(cats.indexOf(t) < 0) cats.push(t); });
  var bar = document.createElement('div');
  bar.className = 'chips'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Filter achievements'); bar.style.marginBottom = '1.5rem';
  bar.innerHTML = '<button type="button" class="chip" aria-pressed="true" data-f="all">All</button>' +
    cats.map(function(c){ return '<button type="button" class="chip" aria-pressed="false" data-f="' + c + '">' + c + '</button>'; }).join('');
  grid.parentNode.insertBefore(bar, grid);
  bar.addEventListener('click', function(e){
    var c = e.target.closest('.chip'); if(!c) return;
    bar.querySelectorAll('.chip').forEach(function(x){ x.setAttribute('aria-pressed', x === c); });
    var i = 0;
    cards.forEach(function(k){
      k.hidden = c.dataset.f !== 'all' && k.dataset.cat !== c.dataset.f;
      if(!k.hidden){ k.style.setProperty('--i', i++); k.style.animation = 'none'; void k.offsetWidth; k.style.animation = ''; }
    });
  });

  // experience accordion
  document.querySelector('.timeline').addEventListener('click', function(e){
    var btn = e.target.closest('.acc'); if(!btn) return;
    var li = btn.closest('li'), closed = li.classList.toggle('closed');
    btn.setAttribute('aria-expanded', !closed);
  });
  [].slice.call(document.querySelectorAll('.timeline li')).forEach(function(li, i){
    if(i >= 3){ li.classList.add('closed'); li.querySelector('.acc').setAttribute('aria-expanded', 'false'); }
  });

  // previous / next
  var labels = links.map(function(a){ return a.textContent; });
  names.forEach(function(n, i){
    var tgt = views.filter(function(v){ return v.dataset.view === n; }).pop(), w = tgt.querySelector('.wrap');
    var pg = document.createElement('div'); pg.className = 'pager';
    var h = '';
    if(i > 0) h += '<a class="btn ghost" href="#' + names[i-1] + '">← ' + labels[i-1] + '</a>';
    h += '<span class="note">Tip: use the ← → keys to switch pages</span>';
    if(i < names.length - 1) h += '<a class="btn' + (i === 0 ? ' only-next' : '') + '" href="#' + names[i+1] + '">' + labels[i+1] + ' →</a>';
    pg.innerHTML = h; w.appendChild(pg);
  });
  document.addEventListener('keydown', function(e){
    if(e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if(e.target.closest('input,select,textarea') || box.open) return;
    var cur = Math.max(0, names.indexOf(location.hash.slice(1)));
    if(e.key === 'ArrowRight' && cur < names.length - 1) location.hash = names[cur + 1];
    if(e.key === 'ArrowLeft' && cur > 0) location.hash = names[cur - 1];
  });

  // lightbox
  var box = document.getElementById('lightbox'), big = box.querySelector('img'), lbCap = document.getElementById('lbCap');
  document.addEventListener('click', function(e){
    var zb = e.target.closest('.zoom'); if(!zb) return;
    var im = zb.querySelector('img'); big.src = im.src; big.alt = im.alt; lbCap.textContent = im.alt; box.showModal();
  });
  box.addEventListener('click', function(e){ if(e.target === box) box.close(); });

  // copy buttons
  var cmsg = document.getElementById('copyMsg');
  document.querySelectorAll('.copy').forEach(function(btn){
    btn.addEventListener('click', function(){
      var el = document.getElementById(btn.dataset.t);
      function sel(){ var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); cmsg.textContent = 'Selected. Press copy on your keyboard.'; }
      try { navigator.clipboard.writeText(el.textContent).then(function(){ cmsg.textContent = 'Copied'; }, sel); } catch(x){ sel(); }
    });
  });

  show();

  document.querySelectorAll('.year').forEach(function(y){
    y.textContent = new Date().getFullYear();
  });
})();

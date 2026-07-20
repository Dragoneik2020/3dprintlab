(function () {
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  var data = loadData();
  if (!data) return;

  // Sync from API silently (data stays in localStorage for next load)
  syncFromAPI();

  applyTexts();
  applySections();
  applyShowcase();
  applyCounters();
  rebuildGrid('.srv-grid', '.srv-card', renderService, data.services);
  rebuildGrid('.gal-grid', '.gal-card', renderGalleryItem, data.gallery);
  rebuildSteps(data.process);
  rebuildGrid('.test-grid', '.test-card', renderTestimonial, data.testimonials);

  function applyTexts() {
    document.title = data.site.title;

    var logo = $('.logo-text');
    if (logo) logo.innerHTML = '<span>' + esc(data.site.logo) + '</span><span class="logo-accent">' + esc(data.site.logoAccent) + '</span>';

    var badge = $('.hero-badge');
    if (badge) badge.innerHTML = '<span class="badge-emoji">✨</span> ' + esc(data.hero.badge);

    var title = $('.hero-title');
    if (title) title.innerHTML = esc(data.hero.title1) + '<br><span class="grad-text">' + esc(data.hero.title2) + '</span>';

    var desc = $('.hero-desc');
    if (desc) desc.textContent = data.hero.description;

    var btn1 = $('.hero-btns .btn-primary');
    if (btn1) {
      var tn = Array.from(btn1.childNodes).find(function (n) { return n.nodeType === 3; });
      if (tn) tn.textContent = data.hero.btnPrimary + ' ';
    }
    var btn2 = $('.hero-btns .btn-outline');
    if (btn2) btn2.textContent = data.hero.btnSecondary;

    // Tags
    var tagsContainer = $('.hero-tags');
    if (tagsContainer && data.hero.tags) {
      tagsContainer.innerHTML = data.hero.tags.map(function(t) {
        return '<span>' + esc(t) + '</span>';
      }).join('');
    }

    // Footer
    var fdesc = $('.footer-bd p');
    if (fdesc) fdesc.innerHTML = esc(data.footer.description) + '<br>' + esc(data.footer.country);

    var fbot = $('.footer-bot p');
    if (fbot) fbot.textContent = data.footer.copyright;

    var fmail = $('.footer-col:last-child a:nth-of-type(1)');
    if (fmail) { fmail.textContent = data.site.email; fmail.href = 'mailto:' + data.site.email; }

    var fwsp = $('.footer-col:last-child a:nth-of-type(2)');
    if (fwsp && data.contact.whatsapp && data.contact.whatsapp !== '#') fwsp.href = data.contact.whatsapp;

    // Contact
    var cwsp = $('.cont-ch.ch-wsp');
    if (cwsp && data.contact.whatsapp && data.contact.whatsapp !== '#') cwsp.href = data.contact.whatsapp;

    var cmail = $('.cont-ch.ch-mail');
    if (cmail) {
      var tn = Array.from(cmail.childNodes).find(function (n) { return n.nodeType === 3; });
      if (tn) tn.textContent = ' ' + data.site.email;
      cmail.href = 'mailto:' + data.site.email;
    }

    var resp = $('.cont-resp');
    if (resp) resp.innerHTML = '<span class="cont-dot-pulse"></span> Respuesta promedio: <strong>' + esc(data.contact.responseTime) + '</strong>';

    var ta = $('form textarea');
    if (ta) ta.placeholder = data.contact.formPlaceholder;
  }

  function applySections() {
    var map = { servicios: 'services', galeria: 'gallery', proceso: 'process', testimonials: 'testimonials', contacto: 'contact' };
    for (var id in map) {
      var sec = document.getElementById(id);
      if (!sec) continue;
      var key = map[id];
      var info = data.sections[key];
      if (!info) continue;
      var tag = sec.querySelector('.sec-tag');
      if (tag && info.tag) tag.textContent = info.tag;
      var h2 = sec.querySelector('h2');
      if (h2 && info.title) h2.textContent = info.title;
      var sp = sec.querySelector('.sec-head > p');
      if (sp && info.description) sp.textContent = info.description;
    }
  }

  function applyShowcase() {
    var featured = null;
    for (var i = 0; i < data.services.length; i++) {
      if (data.services[i].featured) { featured = data.services[i]; break; }
    }
    if (!featured) featured = data.services[0];
    if (!featured) return;

    var img = $('.sc-preview img');
    if (img) {
      var src = featured.productImage || data.showcase.image || '';
      if (src) img.src = src;
    }

    var fn = $('.sc-filename');
    if (fn) fn.textContent = featured.title.replace(/\s+/g, '_').toLowerCase() + '.3mf';

    var rows = $$('.sc-row');
    if (rows[0]) { var s = rows[0].querySelector('strong'); if (s) s.textContent = featured.title; }
    if (rows[1]) { var s = rows[1].querySelector('strong'); if (s) s.textContent = featured.price; }
    if (rows[2]) { var s = rows[2].querySelector('strong'); if (s) s.textContent = data.showcase.finish; }
    if (rows[3]) { var s = rows[3].querySelector('strong'); if (s) s.textContent = data.showcase.time; }

    var bgs = $$('.sc-badge');
    if (bgs[0]) bgs[0].textContent = '⭐ ' + featured.title;
    if (bgs[1]) bgs[1].textContent = data.showcase.badge2;
  }

  function applyCounters() {
    var stats = $$('.h-stat');
    data.hero.stats.forEach(function (s, i) {
      if (!stats[i]) return;
      var num = stats[i].querySelector('.h-stat-num');
      var lbl = stats[i].querySelector('.h-stat-label');
      if (num) { num.dataset.count = s.number; num.textContent = '0'; }
      if (lbl) lbl.textContent = s.label;
    });

    // Run counters
    $$('[data-count]').forEach(function (el) {
      var target = parseInt(el.dataset.count);
      var dur = 1600;
      var start = performance.now();
      function update(now) {
        var t = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - t, 3)) * target);
        if (t < 1) requestAnimationFrame(update);
        else el.textContent = target;
      }
      requestAnimationFrame(update);
    });
  }
})();

// ===== DYNAMIC GRID REBUILDER =====
function rebuildGrid(gridSel, cardSel, renderFn, items) {
  var grid = document.querySelector(gridSel);
  if (!grid) return;
  // On first call, extract template HTML and store it for re-runs
  var html = grid.dataset.tpl;
  if (!html) {
    var template = grid.querySelector(cardSel);
    if (!template) return;
    html = template.outerHTML;
    grid.dataset.tpl = html;
    template.remove();
  }
  grid.innerHTML = '';
  items.forEach(function (item, i) {
    var div = document.createElement('div');
    div.innerHTML = renderFn(item, i, html);
    var card = div.firstElementChild;
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(28px)';
      card.style.transition = 'opacity 500ms ease ' + (i * 80) + 'ms, transform 500ms ease ' + (i * 80) + 'ms';
      grid.appendChild(card);
    }
  });
  requestAnimationFrame(function () {
    grid.querySelectorAll(cardSel).forEach(function (el, i) {
      setTimeout(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 50 + i * 80);
    });
  });
}

function renderService(sv, i, html) {
  var c = sv.featured ? ' srv-card feat' : ' srv-card';
  var badgeHtml = sv.featured ? '<div class="feat-badge">' + esc(sv.badge || '⭐ Destacado') + '</div>' : '';
  return html.replace(/srv-card[^>]*/, c).replace(/<div class="feat-badge">.*?<\/div>/, badgeHtml).replace(/<h3>.*?<\/h3>/, '<h3>' + esc(sv.title) + '</h3>').replace(/<p>.*?<\/p>/, '<p>' + esc(sv.description) + '</p>').replace(/<span class="srv-num">.*?<\/span>/, '<span class="srv-num">' + String(i + 1).padStart(2, '0') + '</span>').replace(/<span class="srv-price">.*?<\/span>/, '<span class="srv-price">' + sv.price + '</span>');
}

function renderGalleryItem(g, i, html) {
  var cls = 'gal-card' + (g.tall ? ' tall' : '');
  var colors = ['#fef3c7,#fde68a', '#fce4ec,#f8bbd0', '#e0f2fe,#bae6fd', '#f3e8ff,#e9d5ff', '#d1fae5,#a7f3d0', '#ffe4e6,#fecdd3'];
  var c = colors[i % colors.length].split(',');
  var imgTag = '<img src="' + escUrl(g.image || '') + '" alt="' + esc(g.caption || '') + '" loading="lazy">';
  var tagSpan = '<span class="gal-tag">' + esc(g.tag || '') + '</span>';
  return html.replace(/class="gal-card[^"]*"/, 'class="' + cls + '"').replace(/style="--c1:[^;]+;--c2:[^"]+"/, 'style="--c1:' + c[0] + ';--c2:' + c[1] + '"').replace(/<img[^>]+>/, imgTag).replace(/<span class="gal-tag">.*?<\/span>/, tagSpan).replace(/<strong>.*?<\/strong>/, '<strong>' + esc(g.caption || '') + '</strong>').replace(/<span>.*?<\/span>/, '<span>' + esc(g.detail || '') + '</span>');
}

function renderTestimonial(t, i, html) {
  return html.replace(/<div class="test-stars">.*?<\/div>/, '<div class="test-stars">' + esc(t.stars || '') + '</div>').replace(/<p>.*?<\/p>/, '<p>\u201C' + esc(t.text || '') + '\u201D</p>').replace(/<div class="test-avatar">.*?<\/div>/, '<div class="test-avatar">' + esc(t.initials || '') + '</div>').replace(/<strong>.*?<\/strong>/, '<strong>' + esc(t.author || '') + '</strong>').replace(/<span>.*?<\/span>/, '<span>' + esc(t.role || '') + '</span>');
}

function rebuildSteps(items) {
  var container = document.querySelector('.procs-steps');
  if (!container) return;
  var template = container.querySelector('.procs-step');
  if (!template) return;
  var tplHtml = template.outerHTML;
  container.innerHTML = '';
  items.forEach(function (p, i) {
    if (i > 0) {
      var conn = document.createElement('div');
      conn.className = 'procs-conn';
      conn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      container.appendChild(conn);
    }
    var div = document.createElement('div');
    div.innerHTML = tplHtml.replace(/<span class="procs-num">.*?<\/span>/, '<span class="procs-num">' + esc(p.number || String(i + 1)) + '</span>').replace(/<h4>.*?<\/h4>/, '<h4>' + esc(p.title || '') + '</h4>').replace(/<p>.*?<\/p>/, '<p>' + esc(p.description || '') + '</p>');
    var step = div.firstElementChild;
    if (step) {
      step.style.opacity = '0';
      step.style.transform = 'translateY(28px)';
      step.style.transition = 'opacity 500ms ease ' + (i * 80) + 'ms, transform 500ms ease ' + (i * 80) + 'ms';
      container.appendChild(step);
    }
  });
  requestAnimationFrame(function () {
    container.querySelectorAll('.procs-step').forEach(function (el, i) {
      setTimeout(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 50 + i * 80);
    });
  });
}

function esc(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escUrl(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Called by data.js autoSync when fresh data arrives from the DB
function applyData() {
  var d = loadData();
  if (!d) return;
  function _$(sel, ctx) { return (ctx || document).querySelector(sel); }
  function _$$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  // Site title
  document.title = d.site.title;

  // Logo
  var logo = _$('.logo-text');
  if (logo) logo.innerHTML = '<span>' + esc(d.site.logo) + '</span><span class="logo-accent">' + esc(d.site.logoAccent) + '</span>';

  // Hero badge
  var badge = _$('.hero-badge');
  if (badge) badge.innerHTML = '<span class="badge-emoji">✨</span> ' + esc(d.hero.badge);

  // Hero title (keep grad-text span)
  var title = _$('.hero-title');
  if (title) title.innerHTML = esc(d.hero.title1) + '<br><span class="grad-text">' + esc(d.hero.title2) + '</span>';

  // Hero description
  var desc = _$('.hero-desc');
  if (desc) desc.textContent = d.hero.description;

  // Hero buttons
  var btn1 = _$('.hero-btns .btn-primary');
  if (btn1) {
    var tn = Array.from(btn1.childNodes).find(function (n) { return n.nodeType === 3; });
    if (tn) tn.textContent = d.hero.btnPrimary + ' ';
  }
  var btn2 = _$('.hero-btns .btn-outline');
  if (btn2) btn2.textContent = d.hero.btnSecondary;

  // Hero tags
  var tagsContainer = _$('.hero-tags');
  if (tagsContainer && d.hero.tags) {
    tagsContainer.innerHTML = d.hero.tags.map(function(t) {
      return '<span>' + esc(t) + '</span>';
    }).join('');
  }

  // Footer
  var fdesc = _$('.footer-bd p');
  if (fdesc) fdesc.innerHTML = esc(d.footer.description) + '<br>' + esc(d.footer.country);
  var fbot = _$('.footer-bot p');
  if (fbot) fbot.textContent = d.footer.copyright;

  // Footer contact links
  var fmail = _$('.footer-col:last-child a:nth-of-type(1)');
  if (fmail) { fmail.textContent = d.site.email; fmail.href = 'mailto:' + d.site.email; }
  var fwsp = _$('.footer-col:last-child a:nth-of-type(2)');
  if (fwsp && d.contact.whatsapp && d.contact.whatsapp !== '#') fwsp.href = d.contact.whatsapp;

  // Contact section
  var cwsp = _$('.cont-ch.ch-wsp');
  if (cwsp && d.contact.whatsapp && d.contact.whatsapp !== '#') cwsp.href = d.contact.whatsapp;
  var cmail = _$('.cont-ch.ch-mail');
  if (cmail) {
    var ct = Array.from(cmail.childNodes).find(function(n){return n.nodeType===3;});
    if (ct) ct.textContent = ' ' + d.site.email;
    cmail.href = 'mailto:' + d.site.email;
  }
  var resp = _$('.cont-resp');
  if (resp) resp.innerHTML = '<span class="cont-dot-pulse"></span> Respuesta promedio: <strong>' + esc(d.contact.responseTime) + '</strong>';
  var ta = _$('form textarea');
  if (ta) ta.placeholder = d.contact.formPlaceholder || 'Escribe tu mensaje...';

  // Section headers (map HTML IDs to data keys)
  var secMap = { servicios: 'services', galeria: 'gallery', proceso: 'process', testimonios: 'testimonials', contacto: 'contact' };
  for (var id in secMap) {
    var sec = document.getElementById(id);
    if (!sec) continue;
    var info = d.sections && d.sections[secMap[id]];
    if (!info) continue;
    var tag = sec.querySelector('.sec-tag');
    if (tag && info.tag) tag.textContent = info.tag;
    var h2 = sec.querySelector('h2');
    if (h2 && info.title) h2.textContent = info.title;
    var sp = sec.querySelector('.sec-head > p');
    if (sp && info.description) sp.textContent = info.description;
  }

  // Showcase
  applyShowcaseRe();

  // Hero stats
  if (d.hero.stats) {
    var statsEls = _$$('.h-stat');
    d.hero.stats.forEach(function(s, i) {
      if (!statsEls[i]) return;
      var num = statsEls[i].querySelector('.h-stat-num');
      var lbl = statsEls[i].querySelector('.h-stat-label');
      if (num) { num.dataset.count = s.number; num.textContent = '0'; }
      if (lbl) lbl.textContent = s.label;
    });
  }

  // Grids
  rebuildGrid('.srv-grid', '.srv-card', renderService, d.services);
  rebuildGrid('.gal-grid', '.gal-card', renderGalleryItem, d.gallery);
  rebuildSteps(d.process);
  rebuildGrid('.test-grid', '.test-card', renderTestimonial, d.testimonials);

  // Re-trigger counter animation
  applyCountersRe();
}
function applyShowcaseRe() {
  var d = loadData(); if (!d) return;
  var feat = d.services && d.services.find(function(s){return s.featured === true || s.featured === 'true';}) || (d.services && d.services[0]);
  if (!feat) { _showcaseFallback(d); return; }
  var img = document.querySelector('.sc-preview img');
  if (img) { var src = feat.productImage || feat.image || ''; img.src = escUrl(src); img.alt = esc(feat.title); }
  var fn = document.querySelector('.sc-filename');
  if (fn) { fn.innerHTML = '<div class="sc-line"></div><span>' + esc(feat.title) + '</span><div class="sc-line"></div>'; }
  var rows = document.querySelectorAll('.sc-row');
  if (rows[0]) rows[0].innerHTML = '<span class="sc-label">Precio</span><span class="sc-val">' + (feat.price || '—') + '</span>';
  if (rows[1]) rows[1].innerHTML = '<span class="sc-label">Categoría</span><span class="sc-val">' + esc(feat.category || 'Impresión 3D') + '</span>';
  if (rows[2]) rows[2].innerHTML = '<span class="sc-label">Vendidos</span><span class="sc-val">' + (feat.sold || 0) + '</span>';
  if (rows[3]) rows[3].innerHTML = '<span class="sc-label">Valoración</span><span class="sc-val">★ ' + (feat.rating || '5.0') + '</span>';
  var desc = document.querySelector('.sc-desc p');
  if (desc) desc.textContent = feat.description || '';
  var bgs = document.querySelectorAll('.sc-badge');
  if (bgs[0]) bgs[0].textContent = '✨ ' + esc(feat.title);
}
function _showcaseFallback(d) {
  var img = document.querySelector('.sc-preview img');
  if (img){ img.src=''; img.alt=''; }
  var fn=document.querySelector('.sc-filename');
  if(fn)fn.innerHTML='<div class="sc-line"></div><span>Producto Destacado</span><div class="sc-line"></div>';
}
function applyCountersRe() {
  var stats = document.querySelectorAll('.h-stat');
  stats.forEach(function(el) {
    var num = el.querySelector('.h-stat-num');
    if (!num) return;
    var target = parseInt(num.dataset.count);
    var dur = 1500;
    var start = performance.now();
    function update(now) {
      var t = Math.min((now - start) / dur, 1);
      num.textContent = Math.floor((1 - Math.pow(1 - t, 3)) * target);
      if (t < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

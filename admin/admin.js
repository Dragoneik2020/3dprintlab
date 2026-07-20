const ADMIN_PASS = 'admin123';
let data = loadData();
let currentSection = 'general';

function render() {
  const app = document.getElementById('app');
  const logged = sessionStorage.getItem('admin_logged');
  if (logged !== 'true') {
    app.innerHTML = document.getElementById('login-template').innerHTML;
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = e.target.querySelector('input').value;
      if (pass === ADMIN_PASS) {
        sessionStorage.setItem('admin_logged', 'true');
        render();
      } else {
        alert('Contraseña incorrecta');
      }
    });
    return;
  }
  app.innerHTML = document.getElementById('dashboard-template').innerHTML;
  bindDashboard();
  navigate('general');
}

function bindDashboard() {
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const section = a.dataset.section;
      navigate(section);
    });
  });
  document.getElementById('saveAllBtn').addEventListener('click', saveAll);
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFileInput').click();
  });
  document.getElementById('importFileInput').addEventListener('change', importFromFile);
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('admin_logged');
    render();
  });
  // Check DB status + auto-retry pending
  checkDbStatus();
  autoRetryPending();
}

function navigate(section) {
  currentSection = section;
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.section === section);
  });
  const titleMap = {
    general: 'General', hero: 'Hero', showcase: 'Showcase',
    services: 'Servicios', gallery: 'Galería', process: 'Proceso',
    testimonials: 'Testimonios', sections: 'Secciones',
    contact: 'Contacto', footer: 'Footer', debug: '🔍 Debug'
  };
  document.getElementById('sectionTitle').textContent = titleMap[section] || section;
  const content = document.getElementById('sectionContent');
  content.innerHTML = '';
  content.appendChild(renderSection(section));
  setSaveStatus('Listo');
}

function setSaveStatus(msg, isError = false) {
  const el = document.getElementById('saveStatus');
  el.textContent = msg;
  el.style.color = isError ? '#ef4444' : 'var(--fg-light)';
  if (!isError) setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 3000);
}

function saveAll() {
  const btn = document.getElementById('saveAllBtn');
  const origText = btn.innerHTML;
  btn.innerHTML = '💾 Guardando...';
  btn.disabled = true;
  setSaveStatus('⏳ Guardando...');

  // Save to localStorage (always works)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { /* ignore */ }

  // Save to API
  const url = (window.location.port === '3001' ? '' : 'http://localhost:3001') + '/api/data';
  fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: data })
  })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        setSaveStatus('✅ Guardado en DB y localStorage');
        updateDbIndicator(true, false);
      } else {
        markPendingSync(data);
        setSaveStatus('⚠️ Guardado local (DB: ' + (res.error || 'no disponible') + '). Se sincroniza al reconectar.', true);
        updateDbIndicator(true, true);
      }
      btn.innerHTML = origText;
      btn.disabled = false;
    })
    .catch(err => {
      markPendingSync(data);
      setSaveStatus('⚠️ Guardado local. Se sincroniza al reconectar la DB.', true);
      updateDbIndicator(false, true);
      btn.innerHTML = origText;
      btn.disabled = false;
    });
}

let _dbIndicator = null;
function checkDbStatus() {
  _dbIndicator = document.createElement('span');
  _dbIndicator.className = 'db-status';
  document.querySelector('.header-actions')?.prepend(_dbIndicator);
  updateDbIndicator(null, hasPendingSync());
}

function updateDbIndicator(dbOk, hasPending) {
  if (!_dbIndicator) return;
  if (dbOk === true) {
    _dbIndicator.innerHTML = hasPending ? '🟡 DB+📤' : '🟢 DB';
    _dbIndicator.title = hasPending ? 'DB conectada, subiendo cambios pendientes...' : 'PostgreSQL conectado';
  } else if (dbOk === false) {
    _dbIndicator.innerHTML = hasPending ? '🟠 Local+📤' : '🔴 DB';
    _dbIndicator.title = hasPending ? 'DB offline, cambios pendientes guardados localmente' : 'DB no disponible';
  } else {
    _dbIndicator.innerHTML = hasPending ? '🟡 DB+📤' : '⚪ DB';
    _dbIndicator.title = hasPending ? 'Cambios pendientes, intentando sincronizar...' : 'Verificando...';
  }
}

function autoRetryPending() {
  setInterval(function() {
    if (!hasPendingSync()) return;
    syncPending(function(ok) {
      if (ok) updateDbIndicator(true, false);
    });
  }, 10000);
}

function collectFormData(container, obj) {
  const inputs = container.querySelectorAll('[name]');
  inputs.forEach(inp => {
    const name = inp.name;
    const keys = name.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    const lastKey = keys[keys.length - 1];
    if (inp.type === 'checkbox') {
      current[lastKey] = inp.checked;
    } else if (inp.type === 'number') {
      current[lastKey] = parseFloat(inp.value) || 0;
    } else {
      current[lastKey] = inp.value;
    }
  });
}

/* ==================== SECTION RENDERERS ==================== */

function renderSection(section) {
  const frag = document.createDocumentFragment();

  switch (section) {
    case 'general': return renderGeneral();
    case 'hero': return renderHero();
    case 'showcase': return renderShowcase();
    case 'services': return renderServices();
    case 'gallery': return renderGallery();
    case 'process': return renderProcess();
    case 'testimonials': return renderTestimonials();
    case 'sections': return renderSections();
    case 'contact': return renderContact();
    case 'footer': return renderFooter();
    case 'debug': return renderDebug();
  }
  return frag;
}

/* GENERAL */
function renderGeneral() {
  const card = ce('div', 'form-card');
  card.innerHTML = `
    <h3>Configuración general del sitio</h3>
    <p class="hint">Información básica de la tienda</p>
    <div class="form-grid">
      <div class="form-group"><label>Título del sitio</label><input name="site.title" value="${esc(data.site.title)}"></div>
      <div class="form-group"><label>Logo texto</label><input name="site.logo" value="${esc(data.site.logo)}"></div>
      <div class="form-group"><label>Logo acento</label><input name="site.logoAccent" value="${esc(data.site.logoAccent)}"></div>
      <div class="form-group"><label>País</label><input name="site.country" value="${esc(data.site.country)}"></div>
      <div class="form-group"><label>Año copyright</label><input name="site.year" value="${esc(data.site.year)}"></div>
    </div>
  `;
  listen(card);
  return card;
}

/* HERO */
function renderHero() {
  const h = data.hero;
  const card = ce('div', 'form-card');
  card.innerHTML = `
    <h3>Sección Hero</h3>
    <p class="hint">Encabezado principal de la página</p>
    <div class="form-grid">
      <div class="form-group"><label>Badge texto</label><input name="hero.badge" value="${esc(h.badge)}"></div>
      <div class="form-group"><label>Título línea 1</label><input name="hero.title1" value="${esc(h.title1)}"></div>
      <div class="form-group"><label>Título línea 2 (gradiente)</label><input name="hero.title2" value="${esc(h.title2)}"></div>
      <div class="form-group full"><label>Descripción</label><textarea name="hero.description" rows="3">${esc(h.description)}</textarea></div>
      <div class="form-group"><label>Botón principal</label><input name="hero.btnPrimary" value="${esc(h.btnPrimary)}"></div>
      <div class="form-group"><label>Botón secundario</label><input name="hero.btnSecondary" value="${esc(h.btnSecondary)}"></div>
    </div>
    <h3 style="margin:20px 0 12px;font-size:0.9375rem;">Estadísticas</h3>
    <div class="stats-grid">
      ${h.stats.map((s, i) => `
        <div class="stat-card">
          <label>Número</label>
          <input name="hero.stats.${i}.number" type="number" value="${s.number}">
          <label style="margin-top:8px">Etiqueta</label>
          <input name="hero.stats.${i}.label" value="${esc(s.label)}">
        </div>
      `).join('')}
    </div>
    <h3 style="margin:20px 0 12px;font-size:0.9375rem;">Tags</h3>
    <div id="tagsList">
      ${h.tags.map((t, i) => `
        <div class="form-group" style="display:flex;gap:8px;align-items:end;margin-bottom:8px">
          <div style="flex:1"><label>Tag ${i+1}</label><input name="hero.tags.${i}" value="${esc(t)}"></div>
          <button type="button" class="btn btn-sm btn-danger" onclick="removeItem('hero.tags',${i})" style="margin-bottom:2px">✕</button>
        </div>
      `).join('')}
    </div>
    <button type="button" class="btn btn-sm btn-outline" onclick="addTag()" style="margin-top:4px">+ Agregar tag</button>
  `;
  listen(card);
  return card;
}

/* SHOWCASE */
function renderShowcase() {
  const s = data.showcase;
  const card = ce('div', 'form-card');
  card.innerHTML = `
    <h3>Showcase / Demo</h3>
    <p class="hint">Tarjeta de vista previa en el hero</p>
    <div class="form-grid">
      <div class="form-group"><label>Nombre archivo</label><input name="showcase.filename" value="${esc(s.filename)}"></div>
      <div class="form-group"><label>Material</label><input name="showcase.material" value="${esc(s.material)}"></div>
      <div class="form-group"><label>Altura</label><input name="showcase.height" value="${esc(s.height)}"></div>
      <div class="form-group"><label>Acabado</label><input name="showcase.finish" value="${esc(s.finish)}"></div>
      <div class="form-group"><label>Tiempo</label><input name="showcase.time" value="${esc(s.time)}"></div>
      <div class="form-group"><label>Badge 1</label><input name="showcase.badge1" value="${esc(s.badge1)}"></div>
      <div class="form-group"><label>Badge 2</label><input name="showcase.badge2" value="${esc(s.badge2)}"></div>
    </div>
    <div class="form-group" style="margin-top:16px">
      <label>URL imagen showcase</label>
      <div class="img-upload">
        <input name="showcase.image" value="${esc(s.image)}">
        <img class="preview-img" src="${escUrl(s.image)}" onerror="this.style.display='none'">
      </div>
    </div>
  `;
  listen(card);
  return card;
}

/* SERVICES */
function renderServices() {
  const frag = document.createDocumentFragment();

  // Preview card
  const preview = ce('div', 'form-card');
  preview.style.borderLeft = '3px solid var(--accent)';
  preview.innerHTML = `
    <h3>Vista previa de servicios</h3>
    <p class="hint">Así se ven tus servicios en el sitio</p>
    <div style="display:flex;gap:12px;overflow-x:auto;padding:8px 0">
      ${data.services.map((sv, i) => `
        <div style="min-width:200px;max-width:240px;background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:16px;flex-shrink:0">
          <span style="font-size:0.6875rem;color:var(--fg-muted)">${String(i+1).padStart(2,'0')}</span>
          ${sv.featured ? '<span style="display:inline-block;background:var(--accent);color:#fff;font-size:0.625rem;padding:2px 8px;border-radius:99px;margin-left:6px">⭐ Destacado</span>' : ''}
          ${sv.productImage ? '<img src="' + escUrl(sv.productImage) + '" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin:8px 0" onerror="this.style.display=\'none\'">' : ''}
          <h4 style="font-size:0.875rem;margin:4px 0">${esc(sv.title)}</h4>
          <p style="font-size:0.75rem;color:var(--fg-muted);margin:0">${esc(sv.description || '').substring(0,60)}...</p>
          <span style="display:inline-block;margin-top:8px;font-size:0.8125rem;font-weight:700;color:var(--accent)">${esc(sv.price)}</span>
        </div>
      `).join('')}
    </div>
  `;
  frag.appendChild(preview);

  // List items
  data.services.forEach((sv, i) => {
    const card = ce('div', 'list-item');
    card.innerHTML = `
      <div class="list-item-header">
        <h4>Servicio ${i + 1}</h4>
        <div class="item-actions">
          <div class="switch-wrap">
            <div class="switch ${sv.featured ? 'on' : ''}" data-switch></div>
            <span class="switch-label">Destacado</span>
          </div>
          <button class="btn btn-sm btn-outline" data-up="${i}">⬆️</button>
          <button class="btn btn-sm btn-outline" data-down="${i}">⬇️</button>
          <button class="btn btn-sm btn-danger" data-remove="${i}">🗑️</button>
        </div>
      </div>
      <input type="hidden" name="services.${i}.featured" value="${sv.featured}">
      <input type="hidden" name="services.${i}.badge" value="${sv.featured ? esc(sv.badge) : ''}">
      <div class="form-grid">
        <div class="form-group"><label>Título</label><input name="services.${i}.title" value="${esc(sv.title)}"></div>
        <div class="form-group"><label>Precio</label><input name="services.${i}.price" value="${esc(sv.price)}"></div>
        <div class="form-group"><label>Imagen producto</label><div class="img-upload"><input name="services.${i}.productImage" value="${esc(sv.productImage || '')}" placeholder="URL imagen"><img class="preview-img" src="${escUrl(sv.productImage || '')}" onerror="this.style.display='none'"></div></div>
        <div class="form-group full"><label>Descripción</label><textarea name="services.${i}.description" rows="2">${esc(sv.description)}</textarea></div>
      </div>
    `;
    const sw = card.querySelector('[data-switch]');
    sw.addEventListener('click', () => {
      sw.classList.toggle('on');
      const on = sw.classList.contains('on');
      const hidden = card.querySelector('[name$=".featured"]');
      hidden.value = on;
      const badge = card.querySelector('[name$=".badge"]');
      badge.value = on ? '⭐ Más pedido' : '';
      data.services[i].featured = on;
      data.services[i].badge = on ? '⭐ Más pedido' : '';
      saveAll();
      setSaveStatus(on ? '⭐ Servicio destacado guardado' : '✏️ Destacado desactivado');
      renderServices();
    });
    card.querySelector('[data-up]')?.addEventListener('click', () => moveItem('services', i, -1, card));
    card.querySelector('[data-down]')?.addEventListener('click', () => moveItem('services', i, 1, card));
    card.querySelector('[data-remove]')?.addEventListener('click', () => removeItem('services', i));
    listen(card);
    frag.appendChild(card);
  });
  const addBtn = ce('button', 'btn btn-outline');
  addBtn.textContent = '+ Añadir servicio';
  addBtn.style.marginTop = '12px';
  addBtn.addEventListener('click', () => {
    data.services.push({ number: String(data.services.length + 1).padStart(2, '0'), icon: 'star', title: 'Nuevo servicio', description: '', price: '0', featured: false, badge: '', productImage: '' });
    saveData(data);
    navigate('services');
  });
  frag.appendChild(addBtn);
  return frag;
}

/* GALLERY */
function renderGallery() {
  const frag = document.createDocumentFragment();
  const grid = ce('div', 'gallery-admin-grid');
  data.gallery.forEach((g, i) => {
    const item = ce('div', 'gallery-admin-item');
    item.innerHTML = `
      <img src="${escUrl(g.image)}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22140%22><rect fill=%22%23e6dfd8%22 width=%22200%22 height=%22140%22/><text x=%2250%22 y=%2250%22 fill=%22%236b5d53%22 font-size=%2214%22>Sin imagen</text></svg>'">
      <div class="item-body">
        <input name="gallery.${i}.image" value="${esc(g.image)}" placeholder="URL imagen" data-preview-img="${i}">
        <input name="gallery.${i}.tag" value="${esc(g.tag)}" placeholder="Tag">
        <input name="gallery.${i}.caption" value="${esc(g.caption)}" placeholder="Título">
        <input name="gallery.${i}.detail" value="${esc(g.detail)}" placeholder="Detalle">
        <div style="display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap">
          <div class="switch-wrap">
            <div class="switch ${g.tall ? 'on' : ''}" data-switch></div>
            <span class="switch-label">Grande</span>
          </div>
          <button class="btn btn-sm btn-outline" data-up="${i}">⬆️</button>
          <button class="btn btn-sm btn-outline" data-down="${i}">⬇️</button>
          <button class="btn btn-sm btn-danger" data-remove="${i}">🗑️</button>
        </div>
        <input type="hidden" name="gallery.${i}.tall" value="${g.tall}">
      </div>
    `;
    const imgEl = item.querySelector('img');
    const imgInput = item.querySelector(`[data-preview-img="${i}"]`);
    if (imgInput && imgEl) {
      imgInput.addEventListener('input', () => { imgEl.src = escUrl(imgInput.value); });
    }
    const sw = item.querySelector('[data-switch]');
    sw.addEventListener('click', () => {
      sw.classList.toggle('on');
      item.querySelector('[name$=".tall"]').value = sw.classList.contains('on');
    });
    item.querySelector('[data-up]')?.addEventListener('click', () => moveItem('gallery', i, -1));
    item.querySelector('[data-down]')?.addEventListener('click', () => moveItem('gallery', i, 1));
    item.querySelector('[data-remove]')?.addEventListener('click', () => removeItem('gallery', i));
    listen(item);
    grid.appendChild(item);
  });
  frag.appendChild(grid);
  const addBtn = ce('button', 'btn btn-outline');
  addBtn.textContent = '+ Añadir trabajo';
  addBtn.style.marginTop = '16px';
  addBtn.addEventListener('click', () => {
    data.gallery.push({ image: '', tag: 'Nuevo', caption: 'Nuevo trabajo', detail: 'Detalle', tall: false });
    saveData(data);
    navigate('gallery');
  });
  frag.appendChild(addBtn);
  return frag;
}

/* PROCESS */
function renderProcess() {
  const frag = document.createDocumentFragment();
  data.process.forEach((p, i) => {
    const card = ce('div', 'list-item');
    card.innerHTML = `
      <div class="list-item-header">
        <h4>Paso ${i + 1}</h4>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm btn-outline" data-up="${i}">⬆️</button>
          <button class="btn btn-sm btn-outline" data-down="${i}">⬇️</button>
          <button class="btn btn-sm btn-danger" data-remove="${i}">🗑️</button>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-group"><label>Título</label><input name="process.${i}.title" value="${esc(p.title)}"></div>
        <div class="form-group"><label>Número</label><input name="process.${i}.number" value="${esc(p.number)}"></div>
        <div class="form-group full"><label>Descripción</label><textarea name="process.${i}.description" rows="2">${esc(p.description)}</textarea></div>
      </div>
    `;
    card.querySelector('[data-up]')?.addEventListener('click', () => moveItem('process', i, -1));
    card.querySelector('[data-down]')?.addEventListener('click', () => moveItem('process', i, 1));
    card.querySelector('[data-remove]')?.addEventListener('click', () => removeItem('process', i));
    listen(card);
    frag.appendChild(card);
  });
  const addBtn = ce('button', 'btn btn-outline');
  addBtn.textContent = '+ Añadir paso';
  addBtn.style.marginTop = '12px';
  addBtn.addEventListener('click', () => {
    data.process.push({ number: String(data.process.length + 1), title: 'Nuevo paso', description: '' });
    saveData(data);
    navigate('process');
  });
  frag.appendChild(addBtn);
  return frag;
}

/* TESTIMONIALS */
function renderTestimonials() {
  const frag = document.createDocumentFragment();
  data.testimonials.forEach((t, i) => {
    const card = ce('div', 'list-item');
    card.innerHTML = `
      <div class="list-item-header">
        <h4>Testimonio ${i + 1}</h4>
        <button class="btn btn-sm btn-outline" data-remove="${i}">🗑️</button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label>Estrellas</label><input name="testimonials.${i}.stars" value="${esc(t.stars)}"></div>
        <div class="form-group"><label>Iniciales avatar</label><input name="testimonials.${i}.initials" value="${esc(t.initials)}"></div>
        <div class="form-group"><label>Autor</label><input name="testimonials.${i}.author" value="${esc(t.author)}"></div>
        <div class="form-group"><label>Rol</label><input name="testimonials.${i}.role" value="${esc(t.role)}"></div>
        <div class="form-group full"><label>Texto</label><textarea name="testimonials.${i}.text" rows="2">${esc(t.text)}</textarea></div>
      </div>
    `;
    card.querySelector('[data-remove]')?.addEventListener('click', () => {
      if (confirm('¿Eliminar este testimonio?')) {
        data.testimonials.splice(i, 1);
        saveData(data);
        navigate('testimonials');
      }
    });
    listen(card);
    frag.appendChild(card);
  });
  const addBtn = ce('button', 'btn btn-outline');
  addBtn.textContent = '+ Añadir testimonio';
  addBtn.style.marginTop = '12px';
  addBtn.addEventListener('click', () => {
    data.testimonials.push({ stars: '★★★★★', text: '', initials: 'XX', author: '', role: '' });
    saveData(data);
    navigate('testimonials');
  });
  frag.appendChild(addBtn);
  return frag;
}

/* SECTIONS */
function renderSections() {
  const card = ce('div', 'form-card');
  const sec = data.sections;
  const keys = Object.keys(sec);
  let html = `<h3>Títulos y descripciones de secciones</h3><p class="hint">Edita los encabezados de cada sección</p>`;
  keys.forEach(key => {
    html += `<div class="form-grid" style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--line)">
      <div class="form-group"><label>${key} — Tag</label><input name="sections.${key}.tag" value="${esc(sec[key].tag)}"></div>
      <div class="form-group"><label>${key} — Título</label><input name="sections.${key}.title" value="${esc(sec[key].title)}"></div>
      ${sec[key].description !== undefined ? `<div class="form-group full"><label>${key} — Descripción</label><input name="sections.${key}.description" value="${esc(sec[key].description)}"></div>` : ''}
    </div>`;
  });
  card.innerHTML = html;
  listen(card);
  return card;
}

/* CONTACT */
function renderContact() {
  const c = data.contact;
  const card = ce('div', 'form-card');
  card.innerHTML = `
    <h3>Información de contacto</h3>
    <p class="hint">Datos que aparecen en la sección de contacto y footer</p>
    <div class="form-grid">
      <div class="form-group"><label>Email</label><input name="site.email" value="${esc(data.site.email)}"></div>
      <div class="form-group"><label>Teléfono</label><input name="site.phone" value="${esc(data.site.phone)}"></div>
      <div class="form-group"><label>WhatsApp (link)</label><input name="contact.whatsapp" value="${esc(c.whatsapp)}"></div>
      <div class="form-group"><label>Email contacto</label><input name="contact.email" value="${esc(c.email)}"></div>
      <div class="form-group"><label>Tiempo de respuesta</label><input name="contact.responseTime" value="${esc(c.responseTime)}"></div>
      <div class="form-group full"><label>Placeholder formulario</label><textarea name="contact.formPlaceholder" rows="2">${esc(c.formPlaceholder)}</textarea></div>
    </div>
  `;
  // Sync contact.email with site.email
  const siteEmail = card.querySelector('[name="site.email"]');
  const contEmail = card.querySelector('[name="contact.email"]');
  siteEmail.addEventListener('input', () => { contEmail.value = siteEmail.value; });
  contEmail.addEventListener('input', () => { siteEmail.value = contEmail.value; });
  listen(card);
  return card;
}

/* FOOTER */
function renderFooter() {
  const f = data.footer;
  const card = ce('div', 'form-card');
  card.innerHTML = `
    <h3>Footer</h3>
    <p class="hint">Texto del pie de página</p>
    <div class="form-grid">
      <div class="form-group"><label>Descripción</label><input name="footer.description" value="${esc(f.description)}"></div>
      <div class="form-group"><label>País / eslogan</label><input name="footer.country" value="${esc(f.country)}"></div>
      <div class="form-group full"><label>Copyright</label><input name="footer.copyright" value="${esc(f.copyright)}"></div>
    </div>
  `;
  listen(card);
  return card;
}

function renderDebug() {
  const card = ce('div', 'form-card');
  const lsRaw = localStorage.getItem(STORAGE_KEY);
  let lsData = null;
  let lsError = null;
  try { if (lsRaw) lsData = JSON.parse(lsRaw); } catch (e) { lsError = e.message; }
  card.innerHTML = `
    <h3>🔍 Diagnóstico de almacenamiento</h3>
    <p class="hint">Verifica que los datos se estén guardando correctamente</p>
    <div class="form-grid">
      <div class="form-group">
        <label>localStorage key</label>
        <input value="${STORAGE_KEY}" readonly style="background:var(--line)">
      </div>
      <div class="form-group">
        <label>Tamaño en localStorage</label>
        <input value="${lsRaw ? (lsRaw.length + ' bytes') : '0 bytes'}" readonly style="background:var(--line)">
      </div>
      <div class="form-group">
        <label>Datos guardados en localStorage</label>
        <div style="margin-top:4px">
          <span style="color:${lsData ? 'var(--brand)' : '#ef4444'};font-weight:600">${lsData ? '✅ Datos presentes' : '❌ No hay datos guardados'}</span>
          ${lsError ? '<br><span style="color:#ef4444">Error: ' + esc(lsError) + '</span>' : ''}
        </div>
      </div>
    </div>
    <h3 style="margin-top:20px;font-size:0.9375rem;">Vista previa del título del Hero</h3>
    <div class="form-grid three">
      <div class="form-group"><label>En memoria (admin)</label><input value="${esc(data.hero?.title1 || '')}" readonly style="background:var(--line)"></div>
      <div class="form-group"><label>En localStorage</label><input value="${esc(lsData?.hero?.title1 || '(vacio)')}" readonly style="background:var(--line)"></div>
      <div class="form-group"><label>¿Coinciden?</label><input value="${data.hero?.title1 === lsData?.hero?.title1 ? '✅ Sí' : '❌ No'}" readonly style="background:var(--line);color:${data.hero?.title1 === lsData?.hero?.title1 ? 'var(--brand)' : '#ef4444'}"></div>
    </div>
    <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-sm btn-primary" id="debugTestSave">🧪 Guardar prueba</button>
      <button class="btn btn-sm btn-outline" id="debugViewJson">👁️ Ver JSON</button>
      <button class="btn btn-sm btn-outline" id="debugClear">🗑️ Limpiar localStorage</button>
      <button class="btn btn-sm btn-outline" id="debugConsole">📋 Abrir consola</button>
    </div>
    <pre id="debugJsonOutput" style="display:none;margin-top:16px;padding:16px;background:var(--bg);border:1px solid var(--line);border-radius:var(--radius-sm);font-size:0.75rem;max-height:400px;overflow:auto;white-space:pre-wrap"></pre>
  `;
  card.querySelector('#debugTestSave').addEventListener('click', () => {
    data.hero.title1 = data.hero.title1 + ' ✓';
    saveAll();
    navigate('debug');
  });
  card.querySelector('#debugViewJson').addEventListener('click', () => {
    const pre = card.querySelector('#debugJsonOutput');
    const lsRaw = localStorage.getItem(STORAGE_KEY);
    pre.textContent = lsRaw ? JSON.stringify(JSON.parse(lsRaw), null, 2) : 'NO DATA';
    pre.style.display = 'block';
  });
  card.querySelector('#debugClear').addEventListener('click', () => {
    if (confirm('¿Limpiar localStorage? Se perderán los cambios no exportados.')) {
      localStorage.removeItem(STORAGE_KEY);
      navigate('debug');
    }
  });
  card.querySelector('#debugConsole').addEventListener('click', () => {
    alert('Abre la consola del navegador (F12 → Console) y revisa los mensajes con [Admin]');
  });
  return card;
}

/* ==================== UTILITIES ==================== */

function ce(tag, cls) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  return el;
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escUrl(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function listen(container) {
  const inputs = container.querySelectorAll('input, textarea, select');
  inputs.forEach(inp => {
    inp.addEventListener('input', () => {
      collectFormData(container, data);
      setSaveStatus('✏️ Sin guardar...');
    });
    inp.addEventListener('change', () => {
      collectFormData(container, data);
      setSaveStatus('✏️ Sin guardar...');
    });
  });
}

function moveItem(key, index, dir) {
  const arr = data[key];
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= arr.length) return;
  [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
  saveData(data);
  navigate(currentSection);
}

function removeItem(key, index) {
  if (!confirm('¿Eliminar este elemento?')) return;
  data[key].splice(index, 1);
  saveData(data);
  navigate(currentSection);
}

function addTag() {
  data.hero.tags.push('Nuevo tag');
  saveData(data);
  navigate(currentSection);
}

function exportData() {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) { alert('No hay datos para exportar'); return; }
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '3dprintlab_backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importFromFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (imported.hero && imported.services && imported.gallery) {
        data = deepMerge(defaultData, imported);
        saveData(data);
        alert('✅ Datos importados correctamente');
        navigate(currentSection);
      } else {
        alert('❌ El archivo no tiene la estructura correcta');
      }
    } catch (err) {
      alert('❌ Error al leer el archivo: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

render();

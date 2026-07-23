const STORAGE_KEY = '3dprintlab_data';
const PENDING_KEY = '3dprintlab_pending';
const API_BASE = '';

const defaultData = {
  site: {
    title: '3DPrintLab | Figuras · Regalos · Impresión 3D',
    logo: '3DPrint',
    logoAccent: 'Lab',
    email: 'hola@3dprintlab.cl',
    phone: '+56 9 XXXX XXXX',
    whatsapp: 'https://wa.me/56972969660',
    country: 'Chile',
    year: '2024'
  },
  hero: {
    badge: 'Figuras · Regalos · Impresión 3D',
    title1: 'Tu imaginación',
    title2: 'hecha realidad',
    description: 'Creamos figuras personalizadas, piezas decorativas y réplicas de alta calidad. El detalle perfecto para tu recuerdo, colección o regalo especial.',
    stats: [
      { number: 500, label: 'figuras creadas' },
      { number: 98, label: '% clientes felices' },
      { number: 3, label: 'días de entrega' }
    ],
    tags: ['🎮 Figuras coleccionables', '💍 Joyería 3D', '🏆 Trofeos personalizados'],
    btnPrimary: 'Cotizar mi pieza',
    btnSecondary: 'Ver galería'
  },
  showcase: {
    filename: 'figura_personalizada.3mf',
    material: 'Resina HD',
    height: '18 cm',
    finish: 'Pintado a mano',
    time: '3 días',
    badge1: '🎨 Pintado a mano',
    badge2: '🖨️ Alta resolución',
    image: 'https://images.unsplash.com/photo-1565043666747-69b6646b9404?w=300&h=300&fit=crop&auto=format'
  },
  services: [
    { number: '01', icon: 'face', title: 'Figuras personalizadas', description: 'De ti mismo, tus seres queridos, mascotas o personajes favoritos. Resina de alta definición con pintura profesional.', price: '250', featured: false, productImage: '' },
    { number: '02', icon: 'star', title: 'Figuras realistas', description: 'Réplicas de personas, mascotas o personajes en resina de alta definición. Ideal para regalos emocionales y recuerdos únicos.', price: '250', featured: true, badge: '⭐ Más pedido', productImage: 'https://images.unsplash.com/photo-1633802993499-0a5d88d6bca1?w=300&h=300&fit=crop&auto=format' },
    { number: '03', icon: 'heart', title: 'Regalos únicos', description: 'Llaveros, réplicas, joyería, decoración para el hogar. El detalle que marca la diferencia en cualquier ocasión.', price: '150', featured: false, productImage: '' }
  ],
  gallery: [
    { image: 'https://images.unsplash.com/photo-1633802993499-0a5d88d6bca1?w=600&h=750&fit=crop&auto=format', tag: 'Figura personalizada', caption: 'Figura heroica', detail: 'Resina · 22 cm · Pintada a mano', tall: true },
    { image: 'https://images.unsplash.com/photo-1604166858601-8e5b2e676ddb?w=600&h=450&fit=crop&auto=format', tag: 'Joyería 3D', caption: 'Colgante floral', detail: 'Resina HD · Pintado a mano', tall: false },
    { image: 'https://images.unsplash.com/photo-1617895153857-82fe79adfcd4?w=600&h=450&fit=crop&auto=format', tag: 'Trofeo', caption: 'Trofeo personalizado', detail: 'PLA premium · Pintado a mano', tall: false },
    { image: 'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=600&h=450&fit=crop&auto=format', tag: 'Accesorio', caption: 'Llavero mascota', detail: 'PLA premium · 8 cm', tall: false },
    { image: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=600&h=450&fit=crop&auto=format', tag: 'Réplica mascota', caption: 'Figura de tu perro', detail: 'Resina · 15 cm · Pintado a mano', tall: false },
    { image: 'https://images.unsplash.com/photo-1513200380193-76b2533e9e4c?w=600&h=750&fit=crop&auto=format', tag: 'Regalo romántico', caption: 'Caja corazón personalizada', detail: 'Resina translúcida · LED incluido', tall: true }
  ],
  process: [
    { number: '1', title: 'Cuéntanos tu idea', description: 'Una foto, un boceto o una descripción. Nosotros la convertimos en modelo 3D.' },
    { number: '2', title: 'Aprobación y pago', description: 'Te enviamos el diseño 3D para que lo apruebes antes de imprimir.' },
    { number: '3', title: 'Impresión y acabado', description: 'Imprimimos en alta resolución, lijamos y pintamos a mano según el pedido.' },
    { number: '4', title: 'Recibe tu pieza', description: 'Empacada con cuidado y lista para regalar, exhibir o atesorar.' }
  ],
  testimonials: [
    { stars: '★★★★★', text: 'Le regalé una figura de su perro a mi novia y lloró de la emoción. El detalle es increíble, se parece muchísimo.', initials: 'AG', author: 'Ana García', role: 'Cliente recurrente' },
    { stars: '★★★★★', text: 'Pedí unos llaveros personalizados para los invitados de mi matrimonio y todos quedaron fascinados. La calidad es increíble, los recomiendo 100%.', initials: 'RM', author: 'Ricardo Mendoza', role: 'Emprendedor' },
    { stars: '★★★★★', text: 'Hicieron una réplica de mi gato en resina pintada a mano. Parece de verdad. El precio muy justo para la calidad.', initials: 'CL', author: 'Camila López', role: 'Diseñadora gráfica' }
  ],
  sections: {
    services: { tag: 'Servicios', title: 'Lo que hacemos por ti', description: 'Desde una figura simple hasta piezas detalladas con pintura profesional' },
    gallery: { tag: 'Galería', title: 'Algunos de nuestros trabajos', description: 'Cada pieza es única y hecha con amor al detalle' },
    process: { tag: 'Proceso', title: 'Así de fácil' },
    testimonials: { tag: 'Testimonios', title: 'Lo que dicen nuestros clientes' },
    contact: { tag: 'Contacto', title: '¿Tienes una idea?', description: 'Cuéntanos qué te gustaría crear y te cotizamos sin compromiso. Respondemos en menos de 1 hora.' }
  },
  contact: {
    whatsapp: 'https://wa.me/56972969660',
    email: 'hola@3dprintlab.cl',
    responseTime: 'menos de 1 hora',
    formPlaceholder: 'Cuéntanos tu idea: qué es, para quién, colores, estilo, fecha límite...'
  },
  footer: {
    description: 'Figuras, réplicas y regalos personalizados.',
    country: 'Chile · Calidad y detalle garantizados.',
    copyright: '© 2024 3DPrintLab · Hecho con ❤️ en Chile'
  }
};

// Load from localStorage (synchronous, for instant page render)
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return deepMerge(defaultData, parsed);
    }
  } catch (e) { console.warn('Error loading data:', e); }
  return JSON.parse(JSON.stringify(defaultData));
}

// Save to localStorage + API (async)
function saveData(data, callback) {
  // Always save to localStorage
  let ok = false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    ok = true;
  } catch (e) { console.error('Error saving to localStorage:', e); }

  // Try API in background
  saveToAPI(data, function(apiOk) {
    if (callback) callback(ok && apiOk !== false);
  });

  return ok;
}

// Async: fetch from API and merge into localStorage
function syncFromAPI(callback) {
  var url = API_BASE + '/api/data';
  fetch(url)
    .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function(res) {
      if (res.data && Object.keys(res.data).length > 0) {
        var merged = deepMerge(loadData(), res.data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        if (callback) callback(true, merged);
      } else {
        if (callback) callback(false);
      }
    })
    .catch(function(err) {
      console.log('API sync unavailable (server may be off):', err.message);
      if (callback) callback(false);
    });
}

// Async: save data to API
function saveToAPI(data, callback) {
  var url = API_BASE + '/api/data';
  fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: data })
  })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res.success) {
        clearPendingSync();
        if (callback) callback(true);
      } else {
        markPendingSync(data);
        if (callback) callback(false);
      }
    })
    .catch(function(err) {
      console.log('API save unavailable:', err.message);
      markPendingSync(data);
      if (callback) callback(false);
    });
}

// Pending sync (offline-first)
function hasPendingSync() {
  return localStorage.getItem(PENDING_KEY) !== null;
}

function markPendingSync(data) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(data)); } catch(e) {}
}

function clearPendingSync() {
  localStorage.removeItem(PENDING_KEY);
}

function syncPending(callback) {
  var raw = localStorage.getItem(PENDING_KEY);
  if (!raw) { if (callback) callback(true); return; }
  var url = API_BASE + '/api/data';
  try {
    var data = JSON.parse(raw);
    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: data })
    })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) {
          clearPendingSync();
          console.log('🗄️ Cambios pendientes sincronizados a la DB');
          if (callback) callback(true);
        } else {
          if (callback) callback(false);
        }
      })
      .catch(function() { if (callback) callback(false); });
  } catch(e) { localStorage.removeItem(PENDING_KEY); if (callback) callback(false); }
}

// Reset local + API
function resetData(callback) {
  localStorage.removeItem(STORAGE_KEY);
  var url = API_BASE + '/api/reset';
  fetch(url, { method: 'POST' })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (callback) callback(res.success);
    })
    .catch(function() {
      if (callback) callback(true); // local reset worked
    });
  return JSON.parse(JSON.stringify(defaultData));
}

function deepMerge(defaults, overrides) {
  const result = JSON.parse(JSON.stringify(defaults));
  for (const key in overrides) {
    if (overrides.hasOwnProperty(key)) {
      if (typeof overrides[key] === 'object' && overrides[key] !== null && !Array.isArray(overrides[key])) {
        result[key] = deepMerge(result[key] || {}, overrides[key]);
      } else {
        result[key] = JSON.parse(JSON.stringify(overrides[key]));
      }
    }
  }
  return result;
}

function exportData() {
  return localStorage.getItem(STORAGE_KEY);
}

function importData(json) {
  try {
    const parsed = JSON.parse(json);
    saveData(parsed);
    return true;
  } catch (e) { return false; }
}

// Auto-sync: when DB is available, push pending first then pull latest
(function autoSync() {
  var url = API_BASE + '/api/data';
  // Check if DB is reachable
  fetch(url)
    .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function() {
      // DB reachable — push pending first, then pull latest
      syncPending(function() {
        fetch(url)
          .then(function(r2) { return r2.json(); })
          .then(function(res2) {
            if (res2.data && Object.keys(res2.data).length > 0) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(res2.data));
              if (typeof applyData === 'function') applyData();
              console.log('🔄 Datos sincronizados desde la DB');
            }
          })
          .catch(function() {});
      });
    })
    .catch(function() { /* server not available, local data is fine */ });
})();

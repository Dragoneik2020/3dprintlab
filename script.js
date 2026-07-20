// Nav scroll
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));

// Mobile menu
const menuBtn = document.querySelector('.menu-btn');
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        document.querySelector('.nav-links')?.classList.toggle('open');
    });
}

// File upload
const dropZone = document.getElementById('fileDrop');
if (dropZone) {
    const input = dropZone.querySelector('input');
    const span = dropZone.querySelector('span');
    dropZone.addEventListener('click', () => input.click());
    ['dragenter', 'dragover'].forEach(e => {
        dropZone.addEventListener(e, e => { e.preventDefault(); dropZone.classList.add('drag-active'); });
    });
    ['dragleave', 'drop'].forEach(e => {
        dropZone.addEventListener(e, e => { e.preventDefault(); dropZone.classList.remove('drag-active'); });
    });
    dropZone.addEventListener('drop', e => { input.files = e.dataTransfer.files; update(); });
    input.addEventListener('change', update);
    function update() {
        if (!input.files.length) return;
        span.textContent = input.files.length === 1 ? input.files[0].name : `${input.files.length} archivos`;
        span.style.color = '#1a1410';
    }
}

// Form submit (EmailJS + backend fallback)
const form = document.getElementById('contactForm');
if (form) {
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = form.querySelector('.btn');
        const orig = btn.innerHTML;
        btn.innerHTML = 'Enviando...';
        btn.disabled = true;

        var emailjsReady = typeof emailjs !== 'undefined' &&
            typeof EMAILJS_CONFIG !== 'undefined' &&
            EMAILJS_CONFIG.publicKey !== 'TU_PUBLIC_KEY';

        try {
            if (emailjsReady) {
                var fd = new FormData(form);
                var params = {
                    from_name: fd.get('name'),
                    from_email: fd.get('email'),
                    service: fd.get('service'),
                    size: fd.get('size'),
                    message: fd.get('message')
                };
                await emailjs.send(EMAILJS_CONFIG.serviceID, EMAILJS_CONFIG.templateID, params);
                btn.innerHTML = 'Solicitud enviada ✓';
                btn.style.background = '#22c55e';
                btn.style.borderColor = '#22c55e';
            } else {
                var fd2 = new FormData(form);
                var res = await fetch('/api/contact', { method: 'POST', body: fd2 });
                var data = await res.json();
                if (data.success) {
                    btn.innerHTML = 'Solicitud enviada ✓';
                    btn.style.background = '#22c55e';
                    btn.style.borderColor = '#22c55e';
                } else {
                    throw new Error(data.error || 'Error');
                }
            }
        } catch (err) {
            btn.innerHTML = 'Error al enviar';
            btn.style.background = '#ef4444';
            btn.style.borderColor = '#ef4444';
        }

        setTimeout(() => {
            btn.innerHTML = orig;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.disabled = false;
            form.reset();
            if (dropZone) {
                dropZone.querySelector('span').textContent = 'Adjunta foto, boceto o archivo 3D';
                dropZone.querySelector('span').style.color = '';
            }
        }, 3000);
    });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (menuBtn?.classList.contains('active')) menuBtn.click();
        }
    });
});
var EMAILJS_CONFIG = {
  publicKey: 'TU_PUBLIC_KEY',
  serviceID: 'TU_SERVICE_ID',
  templateID: 'TU_TEMPLATE_ID'
};

if (EMAILJS_CONFIG.publicKey !== 'TU_PUBLIC_KEY' && typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
}

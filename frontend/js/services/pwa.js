/**
 * FashionForge — PWA Registration Service
 * Registers service-worker.js and provides install prompts handling.
 */

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
        // Handle updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[FashionForge PWA] New version ready.');
              }
            });
          }
        });
      } catch (err) {
        console.warn('[FashionForge PWA] Service worker registration failed:', err);
      }
    });
  }
}

// Auto-register when imported
if (typeof window !== 'undefined') {
  registerServiceWorker();
}

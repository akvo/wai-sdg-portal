export default function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const url = `${process.env.PUBLIC_URL}/serviceWorker.js`;
    navigator.serviceWorker
      .register(url, {
        scope: '/webform',
      })
      .then((registration) => {
        if (registration.installing) {
          console.info('Service worker installing');
        } else if (registration.waiting) {
          console.info('Service worker installed');
        } else if (registration.active) {
          console.info('Service worker active');
        }
      })
      .catch((err) => {
        console.error('ServiceWorker registration failed: ', err);
      });
  }
}

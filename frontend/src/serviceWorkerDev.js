export default function registerServiceWorker() {
  if (!window.location.pathname.includes('/webform/')) {
    return;
  }
  // only for webform
  if ('serviceWorker' in navigator) {
    const url = `${process.env.PUBLIC_URL}/serviceWorker.js`;
    navigator.serviceWorker
      .register(url)
      .then((res) => {
        console.info(
          'ServiceWorker registration successful with scope: ',
          res.scope
        );
      })
      .catch((err) => {
        console.error('ServiceWorker registration failed: ', err);
      });
  }
}

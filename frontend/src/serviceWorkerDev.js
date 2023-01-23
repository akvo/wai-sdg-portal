export default function registerServiceWorker() {
  if (!window.location.pathname.includes('/webform')) {
    return;
  }
  // only for webform
  const url = `${process.env.PUBLIC_URL}/serviceWorker.js`;
  navigator.serviceWorker.register(url).then((res) => {
    console.error('response', res);
  });
}

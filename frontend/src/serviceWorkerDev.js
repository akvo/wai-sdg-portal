export default function registerServiceWorker() {
  const url = `${process.env.PUBLIC_URL}/serviceWorker.js`;
  navigator.serviceWorker.register(url).then((res) => {
    console.error('response', res);
  });
}

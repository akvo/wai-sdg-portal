/*
 * Thanks to Danny Moerkerke for service worker explanation.
 * https://itnext.io/how-to-make-your-website-work-offline-b5be47b92adc
 * https://itnext.io/how-to-make-your-website-work-offline-part-2-6923b9038dd6
 */

const appName = 'wai-webform';
const version = 1; // indexDB versioning
const cacheName = `${appName}-v${version}`;

// the static files we want to cache
const staticFiles = [
  // routes
  '/',
  '/webform/HeTJ',
  '/webform/DrCL',
  '/webform/CxfC',
  '/webform/Tgxc',
  '/webform/HuLo',
  // assets
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/index.html',
  // favicon & icon
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/wai-logo.png',
];

// #######################################################
// START IndexDB function
// #######################################################
// here we configure IndexedDB with two stores: one for api requests and one for api responses
// 'keyPath' is the key we use to retrieve the request or response, in this case it's the url
// of the request or response
const IDBConfig = {
  name: appName,
  version,
  stores: [
    {
      name: 'api_requests',
      keyPath: 'url',
    },
    {
      name: 'api_responses',
      keyPath: 'url',
    },
  ],
};

// here we create our IndexedDB database
const createIndexedDB = ({ name, version, stores }) => {
  const request = self.indexedDB.open(name, version);
  return new Promise((resolve, reject) => {
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      // here we loop over our stores (one for api requests, one for api responses)
      // we check if they already exist. If not, they are created
      stores.map(({ name, keyPath }) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath });
        }
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// factory function to get the correct store
// we pass it the name and version of the IndexedDB database name and version and it returns
// a function that we pass the name of the correct store (api requests or api responses)
const getStoreFactory =
  (dbName, version) =>
  ({ name }, mode = 'readonly') => {
    return new Promise((resolve, reject) => {
      const request = self.indexedDB.open(dbName, version);
      request.onsuccess = (e) => {
        const db = request.result;
        const transaction = db.transaction(name, mode);
        const store = transaction.objectStore(name);

        return resolve(store);
      };
      request.onerror = (e) => reject(request.error);
    });
  };

// function to open the correct store, uses the factory function
const openStore = getStoreFactory(IDBConfig.name, version);
// #######################################################
// EOL IndexDB function
// #######################################################

// #######################################################
// START Helper function for service worker
// #######################################################
// function that caches a POST request made to our api so we can retry it when we're back online
const cacheApiRequest = async (request) => {
  const headers = [...request.headers.entries()].reduce(
    (obj, [key, value]) => Object.assign(obj, { [`${key}`]: value }),
    {}
  );
  const body = await request.text();
  const serialized = {
    headers,
    body,
    url: request.url,
    method: request.method,
    mode: request.mode,
    credentials: request.credentials,
    cache: request.cache,
    redirect: request.redirect,
    referrer: request.referrer,
  };
  const requestStore = await openStore(IDBConfig.stores[0], 'readwrite');
  requestStore.add(serialized);
};

// here we prefetch the api call and cache the response so we can serve it later
const prefetch = async (url) => {
  const response = await fetch(url);
  // since a response can only be used once, we clone it to store it and then serve the original response
  const clone = response.clone();
  const json = await clone.json();
  cacheApiResponse({ url, json });
  return response.json();
};

// here we cache the api responses so we can use them later if needed when offline
const cacheApiResponse = async (response) => {
  try {
    const store = await openStore(IDBConfig.stores[1], 'readwrite');
    store.add(response);
  } catch (error) {
    console.error('idb error', error);
  }
};

// here we return a cached api response whenever our api is not available
const getCachedApiResponse = (request) => {
  return new Promise((resolve, reject) => {
    openStore(IDBConfig.stores[1]).then((store) => {
      const cachedRequest = store.get(request.url);
      // when there's no error the 'onsuccess' handler is called, but that doesn't mean we have a response in our cache
      // we still have to check if the result is not 'undefined'
      cachedRequest.onsuccess = (e) => {
        return cachedRequest.result === undefined
          ? resolve(null)
          : resolve(new Response(JSON.stringify(cachedRequest.result.json)));
      };
      cachedRequest.onerror = (e) => {
        console.error('cached response error', e, cachedRequest.error);
        return reject(cachedRequest.error);
      };
    });
  });
};

// here we make a call to the api and then cache the response for later use
const networkThenCache = async (request) => {
  const { method, url } = request;
  const requestClone = request.clone();
  try {
    const response = await fetch(request);
    const json = await response.clone().json();
    if (method === 'GET') {
      cacheApiResponse({ url, json });
    }
    return response;
  } catch (e) {
    // if an error occured and it was a POST call, we cache the api request so we can retry it later
    // otherwise we serve a fallback response since there is no response in the cache and the network is not available
    return method === 'POST'
      ? cacheApiRequest(requestClone)
      : new Response(JSON.stringify({ message: 'no response' }));
  }
};

// here we try to serve a cached api response and if it doesn't exist we try the network
const getCachedOrNetworkApiResponse = async (request) =>
  (await getCachedApiResponse(request)) || networkThenCache(request);

// here we retry any cached api requests that were stored earlier when the network was not available
// this is typically called when the client comes back online and the 'sync' event is fired
const retryApiCalls = () => {
  return new Promise((resolve, reject) => {
    openStore(IDBConfig.stores[0]).then((store) => {
      const cursor = store.openCursor();
      cursor.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          fetch(new Request(cursor.value.url, cursor.value)).then(() =>
            resolve(true)
          );
          cursor.continue();
        }
      };
    });
  });
};
// #######################################################
// EOL Helper function for service worker
// #######################################################

// #######################################################
// START Service Worker func handler
// #######################################################
// when our service worker is installed we populate the cache with our static assets
const installHandler = (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(staticFiles))
  );
};

const activateHandler = (e) => {
  if (self.indexedDB) {
    createIndexedDB(IDBConfig);
  }
  return self.clients.claim();
  // use below if we have default api to call
  // const apiToCache = [`/api/xxx`];
  // e.waitUntil(
  //   (async function () {
  //     await Promise.all(apiToCache.map((url) => prefetch(url)));
  //   })()
  // );
};

// our fetch handler which is called on every outgoing request
const fetchHandler = async (e) => {
  const { request } = e;
  const { url } = request;
  const { pathname } = new URL(url);
  // if there's a call to our api, we try to serve a cached response, otherwise we call the api
  // and cache the response for later use
  if (url.includes('/api')) {
    e.respondWith(getCachedOrNetworkApiResponse(request));
  }
  // if it's a request for a static asset we serve it from the cache and when it's not cached we
  // fetch it from the network
  else {
    e.respondWith(
      caches
        .match(request)
        .then((response) => (response ? response : fetch(request)))
    );
  }
};

// when we were offline and come back online, a 'sync' event is fired
// we can now retry any api requests that were cached earlier (if any)
const syncHandler = (e) => {
  e.waitUntil(retryApiCalls());
};
// #######################################################
// EOL Service Worker func handler
// #######################################################

// #######################################################
// START Service Worker Event Call
// #######################################################
self.addEventListener('install', installHandler);
self.addEventListener('activate', activateHandler);
self.addEventListener('fetch', fetchHandler);
self.addEventListener('sync', syncHandler);
// #######################################################
// EOL Service Worker Event Call
// #######################################################

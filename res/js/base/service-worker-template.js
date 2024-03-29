 const CACHE_NAME = "WebDiakoluo-// ID //";
 const ORIGIN = "https://antoninloubiere.github.io";

/* get the files of the app */
function getAppFiles() {
    var f = [];
    // FILES //
    return f;
}

self.addEventListener('install', (e) => {
    console.info('[Service Worker] Install');
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(getAppFiles());
        })
    );
});


self.addEventListener('fetch', (e) => {
    var r = e.request.url.split('?')[0].split('#')[0]; // remove get params
    var request = new Request(r);
    e.respondWith(
        caches.match(request).then((r) => {
            return r || fetch(e.request).then((response) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    var url = new URL(request.url);
                    if (url.origin === ORIGIN && !url.pathname.startsWith('/WebDiakoluo/api/')) { // do not cache the api folder
                        console.info('[Service Worker] Cache new resource: ' + request.url);
                        cache.put(request, response.clone());
                    }
                    return response;
                });
            });
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if(CACHE_NAME.indexOf(key) === -1) {
                    console.info("[Service Worker] Remove cache", key)
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
}); 

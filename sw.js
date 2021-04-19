 const CACHE_NAME = "WebDiakoluo-zs!JuQPp";

/* get the files of the app */
function getAppFiles() {
    var f = [];
    f.push("/WebDiakoluo/about.html");
    f.push("/WebDiakoluo/index.html");
    f.push("/WebDiakoluo/legal.html");
    f.push("/WebDiakoluo/template.html");
    f.push("/WebDiakoluo/res/js/all.min.js");
    f.push("/WebDiakoluo/res/js/diakoluo.min.js");
    f.push("/WebDiakoluo/res/js/pages/index.min.js");
    f.push("/WebDiakoluo/res/css/base.css");
    f.push("/WebDiakoluo/res/css/index.css");
    f.push("/WebDiakoluo/res/font/font.css");
    f.push("/WebDiakoluo/res/font/Roboto/Roboto-BlackItalic.ttf");
    f.push("/WebDiakoluo/res/font/Roboto/Roboto-Italic.ttf");
    f.push("/WebDiakoluo/res/font/Roboto/Roboto-Thin.ttf");
    f.push("/WebDiakoluo/res/font/Roboto/Roboto-Regular.ttf");
    f.push("/WebDiakoluo/res/font/Roboto/Roboto-Black.ttf");
    f.push("/WebDiakoluo/res/font/Roboto/Roboto-Light.ttf");
    f.push("/WebDiakoluo/res/font/Roboto/Roboto-LightItalic.ttf");
    f.push("/WebDiakoluo/res/font/Roboto/Roboto-Bold.ttf");
    f.push("/WebDiakoluo/res/font/Roboto/Roboto-MediumItalic.ttf");
    f.push("/WebDiakoluo/res/font/Roboto/Roboto-Medium.ttf");
    f.push("/WebDiakoluo/res/font/Roboto/Roboto-BoldItalic.ttf");
    f.push("/WebDiakoluo/res/font/Roboto/LICENSE.txt");
    f.push("/WebDiakoluo/res/font/Roboto/Roboto-ThinItalic.ttf");
    f.push("/WebDiakoluo/res/font/Oswald/README.txt");
    f.push("/WebDiakoluo/res/font/Oswald/OFL.txt");
    f.push("/WebDiakoluo/res/font/Oswald/Oswald-Variable.ttf");
    f.push("/WebDiakoluo/res/font/Oswald/static/Oswald-ExtraLight.ttf");
    f.push("/WebDiakoluo/res/font/Oswald/static/Oswald-SemiBold.ttf");
    f.push("/WebDiakoluo/res/font/Oswald/static/Oswald-Bold.ttf");
    f.push("/WebDiakoluo/res/font/Oswald/static/Oswald-Medium.ttf");
    f.push("/WebDiakoluo/res/font/Oswald/static/Oswald-Regular.ttf");
    f.push("/WebDiakoluo/res/font/Oswald/static/Oswald-Light.ttf");
    f.push("/WebDiakoluo/res/img/github_w.svg");
    f.push("/WebDiakoluo/res/img/drop_down.svg");
    f.push("/WebDiakoluo/res/img/shuffle_on.svg");
    f.push("/WebDiakoluo/res/img/info3.svg");
    f.push("/WebDiakoluo/res/img/export.svg");
    f.push("/WebDiakoluo/res/img/wrong.svg");
    f.push("/WebDiakoluo/res/img/view.svg");
    f.push("/WebDiakoluo/res/img/github.svg");
    f.push("/WebDiakoluo/res/img/export_w.svg");
    f.push("/WebDiakoluo/res/img/info.svg");
    f.push("/WebDiakoluo/res/img/home.svg");
    f.push("/WebDiakoluo/res/img/save_w.svg");
    f.push("/WebDiakoluo/res/img/right.svg");
    f.push("/WebDiakoluo/res/img/import_w.svg");
    f.push("/WebDiakoluo/res/img/delete.svg");
    f.push("/WebDiakoluo/res/img/grade.svg");
    f.push("/WebDiakoluo/res/img/checkbox_on.svg");
    f.push("/WebDiakoluo/res/img/info2.svg");
    f.push("/WebDiakoluo/res/img/open_in_new_w.svg");
    f.push("/WebDiakoluo/res/img/add.svg");
    f.push("/WebDiakoluo/res/img/play.svg");
    f.push("/WebDiakoluo/res/img/nav_prev.svg");
    f.push("/WebDiakoluo/res/img/delete_w.svg");
    f.push("/WebDiakoluo/res/img/duplicate.svg");
    f.push("/WebDiakoluo/res/img/cancel.svg");
    f.push("/WebDiakoluo/res/img/grade_w.svg");
    f.push("/WebDiakoluo/res/img/nav_next.svg");
    f.push("/WebDiakoluo/res/img/favicon.svg");
    f.push("/WebDiakoluo/res/img/shuffle.svg");
    f.push("/WebDiakoluo/res/img/settings.svg");
    f.push("/WebDiakoluo/res/img/restart_w.svg");
    f.push("/WebDiakoluo/res/img/restart.svg");
    f.push("/WebDiakoluo/res/img/offline_w.svg");
    f.push("/WebDiakoluo/res/img/edit.svg");
    f.push("/WebDiakoluo/res/img/play_w.svg");
    f.push("/WebDiakoluo/res/img/checkbox.svg");
    f.push("/WebDiakoluo/res/img/edit_w.svg");
    f.push("/WebDiakoluo/res/img/nav_last_w.svg");
    f.push("/WebDiakoluo/res/img/open_in_new_b.svg");
    f.push("/WebDiakoluo/res/img/add_w.svg");
    f.push("/WebDiakoluo/res/img/nav_next_w.svg");
    f.push("/WebDiakoluo/res/img/nav_prev_w.svg");
    f.push("/WebDiakoluo/res/img/nav_first_w.svg");
    f.push("/WebDiakoluo/res/img/import.svg");
    f.push("/WebDiakoluo/res/include/footer-1.html");
    f.push("/WebDiakoluo/res/include/footer-2.html");
    f.push("/WebDiakoluo/res/include/navbar.html");
    f.push("/WebDiakoluo/res/translations/universal.csv");
    f.push("/WebDiakoluo/res/translations/universal.json");
    f.push("/WebDiakoluo/res/translations/en.json");
    f.push("/WebDiakoluo/res/translations/fr.json");
    f.push("/WebDiakoluo/res/translations/translations.csv");
    f.push("/");
    f.push("/css/index.css");
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
                    console.info('[Service Worker] Cache new ressource: ' + request.url);
                    cache.put(request, response.clone());
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
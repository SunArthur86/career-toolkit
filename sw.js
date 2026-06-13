var CACHE_NAME = 'career-toolkit-v4';
var ASSETS = [
  './',
  './index.html',
  './offline.html',
  './css/style.css',
  './js/config.js',
  './js/data.js',
  './data/catalog.json',
  "./data/cat-algo-dp.md",
  "./data/cat-algo-search.md",
  "./data/cat-algo-sort.md",
  "./data/cat-algo-tree.md",
  "./data/cat-browser.md",
  "./data/cat-cicd.md",
  "./data/cat-css.md",
  "./data/cat-data-structure.md",
  "./data/cat-database.md",
  "./data/cat-ddia.md",
  "./data/cat-design-pattern.md",
  "./data/cat-docker.md",
  "./data/cat-engineering.md",
  "./data/cat-git.md",
  "./data/cat-handwrite.md",
  "./data/cat-html.md",
  "./data/cat-http.md",
  "./data/cat-java.md",
  "./data/cat-javascript.md",
  "./data/cat-micro-frontend.md",
  "./data/cat-miniapp.md",
  "./data/cat-network-extra.md",
  "./data/cat-network.md",
  "./data/cat-nodejs.md",
  "./data/cat-os.md",
  "./data/cat-performance.md",
  "./data/cat-project-exp.md",
  "./data/cat-puzzle.md",
  "./data/cat-react.md",
  "./data/cat-scenario.md",
  "./data/cat-security.md",
  "./data/cat-self-intro.md",
  "./data/cat-system-design.md",
  "./data/cat-typescript.md",
  "./data/cat-vue.md",

  './js/interview.js',
  './js/radar.js',
  './js/algorithm.js',
  './js/app.js',
  './manifest.json'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // 导航请求：网络优先，离线时返回缓存的index.html或offline.html
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match('./index.html').then(function(r) {
          return r || caches.match('./offline.html');
        });
      })
    );
    return;
  }
  // 静态资源：缓存优先，网络fallback
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(resp) {
        return caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, resp.clone());
          return resp;
        });
      });
    })
  );
});

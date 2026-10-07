/* HSIA ATM service worker
   - Pages (index.html ...): NETWORK FIRST. Online you always get the newest upload; if the network is down or slower than
     4 seconds, the last saved copy is shown instead (real offline mode).
   - Own files (icons, manifest): stale-while-revalidate.
   - Script / style / font files from the CDNs the app uses: stale-while-revalidate (so Firebase etc. also load offline).
   - Everything else (Firebase data, Google sign-in, flight / weather APIs, video) is never touched.
   Bump VERSION only if you ever want to throw away all saved copies. A normal GitHub upload needs no change here. */
const VERSION = 'hsia-sw-v20261007c';
const SCOPE = self.registration.scope;
const INDEX = new URL('index.html', SCOPE).href;
const PRECACHE = [INDEX, new URL('manifest.json', SCOPE).href, new URL('icon-192.png', SCOPE).href,
  // CL / Exchange form editor (Settings > Important PDF > Edit): saved on first visit so it also works offline
  new URL('forms/forms.js', SCOPE).href, new URL('forms/forms.css', SCOPE).href, new URL('forms/header.png', SCOPE).href];
const CDN_HOSTS = ['www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'];
const PAGE_TIMEOUT = 4000;

self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then(cache=> Promise.all(PRECACHE.map(u=>
    fetch(u, { cache:'reload' }).then(r=> r.ok ? clean(r).then(c=> cache.put(u, c)) : null).catch(()=>{})
  ))));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=> Promise.all(keys.filter(k=> k !== VERSION).map(k=> caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});

// a navigation may not be answered with a redirected response: rebuild it as a plain one
async function clean(res){
  if(!res || !res.redirected) return res;
  const body = await res.clone().blob();
  return new Response(body, { status:res.status, statusText:res.statusText, headers:res.headers });
}

function pageKey(url){
  const u = new URL(url.href);
  u.search = ''; u.hash = '';
  if(u.pathname.endsWith('/')) u.pathname += 'index.html';
  return u.href;
}

const OFFLINE_HTML = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<body style="font-family:system-ui,sans-serif;background:#120F0D;color:#F0F1F3;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px">' +
  '<div><h2>\uD83D\uDCF4 Offline</h2><p>No saved copy yet. Connect to the internet once and open the app again.</p></div>';

async function pageFirst(e, url){
  const cache = await caches.open(VERSION);
  const key = pageKey(url);
  const cached = await cache.match(key);
  const net = fetch(url.href, { cache:'no-cache', credentials:'same-origin' }).then(async res=>{
    if(res && res.ok){
      const ok = await clean(res);
      e.waitUntil(cache.put(key, ok.clone()));
      return ok;
    }
    return cached || res;
  });
  e.waitUntil(net.catch(()=>{}));
  if(!cached) return net.catch(()=> new Response(OFFLINE_HTML, { status:503, headers:{ 'Content-Type':'text/html; charset=utf-8' } }));
  return Promise.race([
    net.catch(()=> cached),
    new Promise(r=> setTimeout(()=> r(cached), PAGE_TIMEOUT))
  ]);
}

async function swr(e, req){
  const cache = await caches.open(VERSION);
  const cached = await cache.match(req);
  const net = fetch(req).then(res=>{
    if(res && (res.ok || res.type === 'opaque')) e.waitUntil(cache.put(req, res.clone()));
    return res;
  }).catch(()=> cached || Response.error());
  if(cached){ e.waitUntil(net.catch(()=>{})); return cached; }
  return net;
}

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if(url.searchParams.has('_probe')) return;
  const same = url.origin === self.location.origin;
  if(same && /\.pdf$/i.test(url.pathname)) return;   // PDFs are big and the app keeps its own saved copy: never duplicate them here
  if(same && (req.mode === 'navigate' || /\.html?$/.test(url.pathname))){ e.respondWith(pageFirst(e, url)); return; }
  if(same){
    if(req.destination === 'video' || req.destination === 'audio') return;
    e.respondWith(swr(e, req)); return;
  }
  if(CDN_HOSTS.indexOf(url.hostname) !== -1 && (req.destination === 'script' || req.destination === 'style' || req.destination === 'font')){
    e.respondWith(swr(e, req));
  }
});

self.addEventListener('message', e=>{ if(e.data === 'SKIP_WAITING') self.skipWaiting(); });

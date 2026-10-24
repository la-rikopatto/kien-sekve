// 次はどこへ：オフラインでも開けるように、ページと字体を端末に保存しておく。
// 開くときはまず保存してある版をすぐ出し、裏で新しい版を取りに行って保存し直す（次に開いたときに新しい版になる）
const CACHE = 'tsugi-v1';   // 共有リンク（?eki=…）で開いても、保存は ? を外した一つにまとめる
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === location.origin, font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!same && !font) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: same });
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(same && url.search ? url.origin + url.pathname : req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});

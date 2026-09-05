/* Service worker for "האוסף של שירלי"
   Strategy: NETWORK FIRST.
   - When online you always get the newest version.
   - Cache is only a fallback for offline use.
   - On the home page, the old SoulCollage reading row is hidden.
*/

const CACHE = 'shirli-v42';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

function hideOldReadingRow(res) {
  const type = res.headers.get('content-type') || '';
  if (!res.ok || !type.includes('text/html')) return Promise.resolve(res);

  return res.text().then((html) => {
    const marker = '<style id="shirli-home-cleanup">.g-read{display:none!important;}</style>';
    if (!html.includes('shirli-home-cleanup')) {
      html = html.replace('</head>', marker + '\n</head>');
    }
    const headers = new Headers(res.headers);
    headers.delete('content-length');
    return new Response(html, {
      status: res.status,
      statusText: res.statusText,
      headers
    });
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  if (req.url.indexOf('/music/') !== -1) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res && (res.status === 200 || res.status === 206)) {
          const copy = res.clone();
          if (res.status === 200) {
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
        }
        return res;
      }))
    );
    return;
  }

  e.respondWith(
    fetch(req)
      .then((res) => {
        const isNavigation = req.mode === 'navigate' || typeIsHtml(res);
        const processed = isNavigation ? hideOldReadingRow(res) : Promise.resolve(res);
        return processed.then((finalRes) => {
          if (finalRes && finalRes.status === 200 && req.url.startsWith(self.location.origin)) {
            const copy = finalRes.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return finalRes;
        });
      })
      .catch(() => caches.match(req))
  );
});

function typeIsHtml(res) {
  if (!res) return false;
  const type = res.headers.get('content-type') || '';
  return type.includes('text/html');
}

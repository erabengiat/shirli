/* Service worker for "האוסף של שירלי"
   Network-first, with a small HTML cleanup layer for the Shirley version.
*/

const CACHE = 'shirli-v45';

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

function cleanShirleyHtml(res) {
  const type = res.headers.get('content-type') || '';
  if (!res.ok || !type.includes('text/html')) return Promise.resolve(res);

  return res.text().then((html) => {
    const marker = `
<style id="shirli-clean-ui">
  .g-read{display:none!important;}

  /* Page detail: image only. */
  #cardDetail .fld,
  #cardDetail .fld-label,
  #cardDetail .fld-note-label,
  #cardDetail .note-box,
  #cardDetail .del-card-btn,
  #cardDetail .detail-name,
  #cardDetail .detail-meta,
  #cardDetail .edit-btn-inline{display:none!important;}
  #cardDetail .detail{padding-bottom:18px!important;}
  #cardDetail .detail-img{margin-bottom:0!important;}

  /* Book gallery: never show legacy names/captions under Shirley's images. */
  #cardsGrid .detail-name,
  #cardsGrid .detail-meta,
  #cardsGrid .card-name,
  #cardsGrid .card-title,
  #cardsGrid .thumb-name,
  #cardsGrid .thumb-title,
  #cardsGrid .caption,
  #cardsGrid figcaption{display:none!important;}
</style>`;

    if (!html.includes('shirli-clean-ui')) {
      html = html.replace('</head>', marker + '\n</head>');
    }

    /* Book view: image tiles only, with no c.name caption. */
    html = html.replace(
      "      '</div>'+\n      '<div style=\"font-family:\\\'Varela Round\\\',sans-serif;font-size:14px;text-align:center;color:#244F5E;margin-top:7px;\">'+c.name+'</div>';",
      "      '</div>';"
    );

    /* Keep one continuous list; no separate landscape section. */
    html = html.replace("wideTitle.textContent='דפים לרוחב';", "wideTitle.textContent='';");
    html = html.replace("wideTitle.style.display='block';", "wideTitle.style.display='none';");
    html = html.replace("wideWrap.appendChild(el);          // move to the wide group", "/* Shirley: keep landscape pages in the main list */");

    /* Help: remove detailed guide button and legacy Ira/SoulCollage wording. */
    html = html.replace(/<button class=\"btn secondary\" onclick=\"showGuide\('full'\)\">מדריך מפורט<\/button>/g, '');
    html = html.replace(/האוסף של עירא/g, 'האוסף של שירלי');
    html = html.replace(/סול קולאז\\' של עירא/g, 'האוסף של שירלי');
    html = html.replace(/אוסף הקולאז\\'ים/g, 'אוסף העבודות');
    html = html.replace(/, קריאות שמורות/g, '');

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
        const processed = isNavigation ? cleanShirleyHtml(res) : Promise.resolve(res);
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

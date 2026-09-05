/* Service worker for "האוסף של שירלי"
   Network-first, with a small HTML cleanup/customization layer for the Shirley version.
*/

const CACHE = 'shirli-v46';

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

  /* Home screen: always one phone-sized screen, no scrolling. */
  #home{min-height:100dvh!important;height:100dvh!important;max-height:100dvh!important;overflow:hidden!important;}
  #home .topbar{padding-top:8px!important;padding-bottom:4px!important;min-height:84px!important;}
  #home .home-logo{width:78px!important;height:78px!important;}
  #home .group{margin:4px 14px 5px!important;padding:8px 10px 9px!important;}
  #home .group-title{font-size:12px!important;margin-bottom:5px!important;}
  #home .group-row{gap:8px!important;}
  #home .tile{min-height:84px!important;padding:5px 2px!important;gap:4px!important;}
  #home .tile .disc{width:60px!important;height:60px!important;border-radius:17px!important;}
  #home .tile .disc svg{width:30px!important;height:30px!important;}
  #home .tile-label{font-size:13px!important;line-height:1.1!important;}
  #home .bottom-row{padding:2px 14px 8px!important;gap:8px!important;}
  #home + .footer{display:none!important;}

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

  /* Slideshow: use the same large image sizing in every order. */
  #slideBody{height:calc(100dvh - 74px)!important;min-height:0!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;padding:0!important;}
  #slideBody .slide-img{display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;margin:0 auto!important;}

  /* Products */
  #products .products-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:14px 16px 28px;}
  #products .product-card{background:rgba(255,255,255,.55);border:1px solid rgba(36,79,94,.14);border-radius:14px;overflow:hidden;box-shadow:0 3px 10px rgba(42,58,71,.11);cursor:pointer;}
  #products .product-img{height:150px;background:#eadfc9;display:flex;align-items:center;justify-content:center;font-size:42px;overflow:hidden;}
  #products .product-img img{width:100%;height:100%;object-fit:cover;display:block;}
  #products .product-info{padding:9px 10px 11px;text-align:center;}
  #products .product-name{font-family:'Varela Round',sans-serif;color:#244F5E;font-size:15px;font-weight:700;}
  #products .product-price{font-size:13px;color:#C0673B;margin-top:4px;font-weight:700;}
  #products .product-cat{font-size:11px;color:#6d7b82;margin-top:3px;}
  #products .empty-note{grid-column:1/-1;text-align:center;padding:30px 10px;color:#6d7b82;}
  #productAdmin{margin-top:22px;border-top:1px solid rgba(36,79,94,.18);padding-top:18px;}
  #productAdmin .product-admin-title{font-family:'Varela Round',sans-serif;color:#C0673B;font-size:16px;margin-bottom:10px;text-align:center;}
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

    const appScript = `
<script id="shirli-products-v1">
(function(){
  const PROD_KEY='shirliProducts';
  const defaults=[
    {id:'cat-bags',name:'תיקים',category:'תיקים',price:'',emoji:'👜',placeholder:true},
    {id:'cat-table',name:'מפות שולחן',category:'מפות שולחן',price:'',emoji:'🪡',placeholder:true},
    {id:'cat-art',name:'תמונות',category:'תמונות',price:'',emoji:'🖼️',placeholder:true},
    {id:'cat-clock',name:'שעונים',category:'שעונים',price:'',emoji:'🕰️',placeholder:true},
    {id:'cat-jewelry',name:'תכשיטים',category:'תכשיטים',price:'',emoji:'📿',placeholder:true},
    {id:'cat-tables',name:'שולחנות',category:'שולחנות',price:'',emoji:'🪵',placeholder:true}
  ];

  function readProducts(){
    try{
      const raw=localStorage.getItem(PROD_KEY);
      if(raw){ const p=JSON.parse(raw); if(Array.isArray(p)) return p; }
    }catch(e){}
    return defaults.slice();
  }
  function saveProducts(p){ try{ localStorage.setItem(PROD_KEY,JSON.stringify(p)); return true; }catch(e){ return false; } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c];}); }

  window.renderShirliProducts=function(){
    const g=document.getElementById('productsGrid'); if(!g) return;
    const p=readProducts();
    if(!p.length){ g.innerHTML='<div class="empty-note">אין עדיין מוצרים.</div>'; return; }
    g.innerHTML=p.map(function(x){
      const pic=x.image?'<img src="'+esc(x.image)+'">':('<span>'+esc(x.emoji||'✨')+'</span>');
      const price=x.price?('<div class="product-price">'+esc(x.price)+' ₪</div>'):'';
      return '<div class="product-card"><div class="product-img">'+pic+'</div><div class="product-info"><div class="product-name">'+esc(x.name)+'</div>'+price+'<div class="product-cat">'+esc(x.category||'מוצר')+'</div></div></div>';
    }).join('');
  };

  function ensureProductsScreen(){
    if(document.getElementById('products')) return;
    const s=document.createElement('div');
    s.className='screen'; s.id='products';
    s.innerHTML='<div class="subhead"><button class="back" onclick="showScreen(\'home\')"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg></button><h2>מוצרים</h2></div><div class="products-grid" id="productsGrid"></div>';
    const app=document.querySelector('.app'); if(app) app.appendChild(s);
  }

  function makeProductsTile(){
    const home=document.getElementById('home'); if(!home) return;
    if(home.querySelector('[data-shirli-products]')) return;
    const view=home.querySelector('.g-view .group-row'); if(!view) return;
    const b=document.createElement('button');
    b.className='tile'; b.setAttribute('data-shirli-products','1');
    b.onclick=function(){ ensureProductsScreen(); renderShirliProducts(); showScreen('products'); };
    b.innerHTML='<span class="disc" style="--key-base:#D9A441;--key-hi:#F0C56B;--key-lo:#B5842C;--key-edge:#8C641F"><svg viewBox="0 0 24 24" fill="none" stroke="#F3EAD8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg></span><span class="tile-label">מוצרים</span>';
    view.appendChild(b);
    view.style.gridTemplateColumns='1fr 1fr 1fr';
  }

  function cleanHome(){
    const home=document.getElementById('home'); if(!home) return;
    home.querySelectorAll('.tile').forEach(function(t){
      const lab=t.querySelector('.tile-label'); if(!lab) return;
      const txt=lab.textContent.trim();
      if(txt==='שליפת דף') t.style.display='none';
      if(txt==='מצגת הדפים') lab.textContent='מצגת העבודות';
      if(txt==='חיפוש דף') lab.textContent='חיפוש';
    });
    makeProductsTile();

    const bottom=home.querySelector('.bottom-row');
    if(bottom && !bottom.querySelector('[data-shirli-share]')){
      const share=document.createElement('button');
      share.className='tile small'; share.setAttribute('data-shirli-share','1');
      share.onclick=function(){ if(typeof shareViewer==='function') shareViewer(); };
      share.innerHTML='<span class="disc" style="--key-base:#A84B6B;--key-hi:#C77190;--key-lo:#853A53;--key-edge:#642A3E"><svg viewBox="0 0 24 24" fill="none" stroke="#F3EAD8" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><line x1="8.2" y1="10.8" x2="15.8" y2="6.2"/><line x1="8.2" y1="13.2" x2="15.8" y2="17.8"/></svg></span><span class="tile-label">שיתוף</span>';
      bottom.insertBefore(share,bottom.lastElementChild);
      bottom.style.gridTemplateColumns='1fr 1fr 1fr';
    }
  }

  let pendingProductImage='';
  function ensureProductAdmin(){
    const settings=document.getElementById('settings'); if(!settings || document.getElementById('productAdmin')) return;
    const form=settings.querySelector('.add-form'); if(!form) return;
    const box=document.createElement('div'); box.id='productAdmin';
    box.innerHTML='<div class="product-admin-title">מוצרים למכירה</div>'+
      '<div class="field"><label>שם המוצר</label><input id="prodName" type="text" placeholder="למשל: תיק בד"></div>'+
      '<div class="field"><label>קטגוריה</label><input id="prodCategory" type="text" placeholder="תיקים, תכשיטים, תמונות..."></div>'+
      '<div class="field"><label>מחיר ₪</label><input id="prodPrice" type="number" min="0" step="1" placeholder="0"></div>'+
      '<div class="field"><label>תמונת מוצר</label><input id="prodImage" type="file" accept="image/*"></div>'+
      '<button class="btn clay" id="addProductBtn" type="button">הוספת מוצר</button>';
    form.appendChild(box);
    const inp=box.querySelector('#prodImage');
    inp.onchange=function(e){
      const f=e.target.files&&e.target.files[0]; if(!f){ pendingProductImage=''; return; }
      const r=new FileReader(); r.onload=function(ev){
        if(typeof shrinkImage==='function') shrinkImage(ev.target.result,function(s){ pendingProductImage=s; });
        else pendingProductImage=ev.target.result;
      }; r.readAsDataURL(f);
    };
    box.querySelector('#addProductBtn').onclick=function(){
      const name=box.querySelector('#prodName').value.trim(); if(!name){ if(typeof tap==='function') tap('נא להזין שם למוצר'); return; }
      const cat=box.querySelector('#prodCategory').value.trim()||'מוצר';
      const price=box.querySelector('#prodPrice').value.trim();
      const p=readProducts().filter(function(x){return !x.placeholder;});
      p.push({id:'p'+Date.now(),name:name,category:cat,price:price,image:pendingProductImage||'',emoji:'✨'});
      saveProducts(p);
      box.querySelector('#prodName').value=''; box.querySelector('#prodCategory').value=''; box.querySelector('#prodPrice').value=''; box.querySelector('#prodImage').value=''; pendingProductImage='';
      if(typeof tap==='function') tap('המוצר נוסף');
      renderShirliProducts();
    };
  }

  document.addEventListener('DOMContentLoaded',function(){
    ensureProductsScreen();
    cleanHome();
    ensureProductAdmin();
    renderShirliProducts();
  });
  window.addEventListener('load',function(){ setTimeout(function(){cleanHome();ensureProductAdmin();},150); });
})();
</script>`;

    if (!html.includes('shirli-products-v1')) {
      html = html.replace('</body>', appScript + '\n</body>');
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

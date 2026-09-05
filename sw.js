/* Shirley app service worker */
const CACHE='shirli-v49';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(xs=>Promise.all(xs.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));

function isHtml(res){return !!res && (res.headers.get('content-type')||'').includes('text/html');}
function cleanHtml(res){
  if(!res.ok||!isHtml(res)) return Promise.resolve(res);
  return res.text().then(html=>{
    const css=`<style id="shirli-v49-css">
      .g-read{display:none!important}
      #home.active{height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;overflow:hidden!important;justify-content:flex-start!important}
      #home .topbar{padding:6px 20px 2px!important;min-height:70px!important;flex:0 0 auto!important}
      #home .home-logo{width:68px!important;height:68px!important;background:url('logo-shirley.svg?v=1') center/cover no-repeat!important;box-shadow:0 3px 10px rgba(42,58,71,.16)!important}
      .brand-mark,.cover-mark{background-image:url('logo-shirley.svg?v=1')!important}
      #home .group{margin:3px 12px!important;padding:6px 8px 7px!important;flex:0 0 auto!important}
      #home .group-title{font-size:11px!important;margin-bottom:4px!important}
      #home .group-row{gap:6px!important}
      #home .tile{min-height:72px!important;padding:3px 2px!important;gap:2px!important}
      #home .tile .disc{width:50px!important;height:50px!important;border-radius:15px!important}
      #home .tile .disc svg{width:26px!important;height:26px!important}
      #home .tile-label{font-size:12px!important;line-height:1.05!important}
      #home .bottom-row{padding:2px 12px 4px!important;gap:6px!important;flex:0 0 auto!important}
      #cardDetail .fld,#cardDetail .fld-label,#cardDetail .fld-note-label,#cardDetail .note-box,#cardDetail .del-card-btn,#cardDetail .detail-name,#cardDetail .detail-meta,#cardDetail .edit-btn-inline{display:none!important}
      #cardsGrid .detail-name,#cardsGrid .detail-meta,#cardsGrid .card-name,#cardsGrid .card-title,#cardsGrid .thumb-name,#cardsGrid .thumb-title,#cardsGrid .caption,#cardsGrid figcaption{display:none!important}
      #slideBody{height:calc(100dvh - 76px)!important;min-height:0!important;background:#111!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;overflow:hidden!important}
      #slideBody .slide-img{display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;margin:auto!important;background:#111!important}
      #products .products-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px 14px 24px}
      #products .product-card{background:rgba(255,255,255,.55);border:1px solid rgba(36,79,94,.14);border-radius:14px;overflow:hidden;box-shadow:0 3px 10px rgba(42,58,71,.11)}
      #products .product-img{height:145px;background:#eadfc9;display:flex;align-items:center;justify-content:center;font-size:38px;overflow:hidden}
      #products .product-img img{width:100%;height:100%;object-fit:cover}
      #products .product-info{text-align:center;padding:8px}.product-name{font-weight:700;color:#244F5E}.product-price{color:#C0673B;font-weight:700;margin-top:3px}.product-cat{font-size:11px;opacity:.7;margin-top:2px}
      #productAdmin{margin-top:20px;border-top:1px solid rgba(36,79,94,.18);padding-top:16px}
    </style>`;
    if(!html.includes('shirli-v49-css')) html=html.replace('</head>',css+'\n</head>');

    html=html.replace("const MUSIC_SRC='music/beloved.mp3';","const MUSIC_SRC='https://commons.wikimedia.org/wiki/Special:Redirect/file/Nocturne_Op._9_no._2_in_E_flat_major.mp3';");
    html=html.replace('const MUSIC_VOL=0.55;','const MUSIC_VOL=0.45;');
    html=html.replace('const FADE_IN_MS=2000;','const FADE_IN_MS=6000;');
    html=html.replace("wideTitle.textContent='דפים לרוחב';","wideTitle.textContent='';");
    html=html.replace("wideTitle.style.display='block';","wideTitle.style.display='none';");
    html=html.replace("wideWrap.appendChild(el);          // move to the wide group","/* Shirley: keep in main list */");
    html=html.replace(/<button class=\"btn secondary\" onclick=\"showGuide\('full'\)\">מדריך מפורט<\/button>/g,'');
    html=html.replace(/האוסף של עירא/g,'האוסף של שירלי').replace(/סול קולאז\\' של עירא/g,'האוסף של שירלי').replace(/אוסף הקולאז\\'ים/g,'אוסף העבודות');

    const js=`<script id="shirli-v49-js">(function(){
      const K='shirliProducts';
      const defaults=[
        {name:'תיקים',category:'תיקים',emoji:'👜'},{name:'מפות שולחן',category:'מפות שולחן',emoji:'🪡'},{name:'תמונות',category:'תמונות',emoji:'🖼️'},
        {name:'שעונים',category:'שעונים',emoji:'🕰️'},{name:'תכשיטים',category:'תכשיטים',emoji:'📿'},{name:'שולחנות',category:'שולחנות',emoji:'🪵'}
      ];
      function resetShirleyTracking(){
        try{
          const marker='shirliTrackingResetV1';
          if(localStorage.getItem(marker)!=='1'){
            localStorage.removeItem('activityLog');
            localStorage.removeItem('usageLog');
            localStorage.setItem('activityLog',JSON.stringify([{t:new Date().toISOString(),text:'התחלת לוג חדש — האוסף של שירלי'}]));
            localStorage.setItem(marker,'1');
            if(typeof sessionStart!=='undefined') sessionStart=Date.now();
          }
        }catch(e){}
      }
      function read(){try{let x=JSON.parse(localStorage.getItem(K)||'null');return Array.isArray(x)?x:defaults.slice()}catch(e){return defaults.slice()}}
      function save(x){try{localStorage.setItem(K,JSON.stringify(x))}catch(e){}}
      function esc(x){return String(x==null?'':x).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
      function ensureProducts(){
        if(!document.getElementById('products')){let s=document.createElement('div');s.id='products';s.className='screen';s.innerHTML='<div class="subhead"><button class="back" onclick="showScreen(\\'home\\')">‹</button><h2>מוצרים</h2></div><div class="products-grid" id="productsGrid"></div>';document.querySelector('.app')?.appendChild(s)}
        renderProducts();
      }
      function renderProducts(){let g=document.getElementById('productsGrid');if(!g)return;g.innerHTML=read().map(x=>'<div class="product-card"><div class="product-img">'+(x.image?'<img src="'+esc(x.image)+'">':esc(x.emoji||'✨'))+'</div><div class="product-info"><div class="product-name">'+esc(x.name)+'</div>'+(x.price?'<div class="product-price">'+esc(x.price)+' ₪</div>':'')+'<div class="product-cat">'+esc(x.category||'מוצר')+'</div></div></div>').join('')}
      function homeFix(){
        let h=document.getElementById('home');if(!h)return;
        h.querySelectorAll('.tile').forEach(t=>{let l=t.querySelector('.tile-label');if(!l)return;let x=l.textContent.trim();if(x==='שליפת דף')t.style.display='none';if(x==='מצגת הדפים')l.textContent='מצגת העבודות';if(x==='חיפוש דף')l.textContent='חיפוש'});
        let row=h.querySelector('.g-view .group-row');
        if(row&&!h.querySelector('[data-products]')){let b=document.createElement('button');b.className='tile';b.dataset.products='1';b.onclick=()=>{ensureProducts();showScreen('products')};b.innerHTML='<span class="disc" style="--key-base:#D9A441;--key-hi:#F0C56B;--key-lo:#B5842C;--key-edge:#8C641F"><svg viewBox="0 0 24 24" fill="none" stroke="#F3EAD8" stroke-width="1.6"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg></span><span class="tile-label">מוצרים</span>';row.appendChild(b);row.style.gridTemplateColumns='1fr 1fr 1fr'}
        let logo=h.querySelector('.home-logo');if(logo){logo.onclick=()=>location.href='landing.html';logo.style.cursor='pointer'}
      }
      function adminFix(){let s=document.getElementById('settings');if(!s||document.getElementById('productAdmin'))return;let host=s.querySelector('.add-form')||s;let box=document.createElement('div');box.id='productAdmin';box.innerHTML='<h3>מוצרים למכירה</h3><div class="field"><label>שם מוצר</label><input id="pn"></div><div class="field"><label>קטגוריה</label><input id="pc"></div><div class="field"><label>מחיר ₪</label><input id="pp" type="number"></div><button class="btn clay" id="pa" type="button">הוספת מוצר</button>';host.appendChild(box);box.querySelector('#pa').onclick=()=>{let n=box.querySelector('#pn').value.trim();if(!n)return;let a=read();a.push({name:n,category:box.querySelector('#pc').value.trim()||'מוצר',price:box.querySelector('#pp').value.trim(),emoji:'✨'});save(a);box.querySelector('#pn').value='';box.querySelector('#pc').value='';box.querySelector('#pp').value='';renderProducts()}}
      function fixSlideshow(){
        window.renderSlide=function(){let c=(typeof slideOrder!=='undefined'&&slideOrder.length)?slideOrder[slideIdx]:null,body=document.getElementById('slideBody');if(!body)return;if(!c){body.innerHTML='';return}let src=c.img||('images/'+c.no+'.jpg');let img=document.createElement('img');img.className='slide-img';img.alt='';img.onerror=()=>{let fallback='images/'+c.no+'.jpg';if(img.getAttribute('data-fallback')!=='1'){img.setAttribute('data-fallback','1');img.src=fallback}else{body.innerHTML='<div style="color:#fff;font-size:14px">לא ניתן לטעון את התמונה</div>'}};body.innerHTML='';body.appendChild(img);img.src=src};
      }
      document.addEventListener('DOMContentLoaded',()=>{resetShirleyTracking();ensureProducts();homeFix();adminFix();fixSlideshow();setTimeout(homeFix,250)});
      window.addEventListener('load',()=>setTimeout(()=>{homeFix();adminFix();fixSlideshow()},300));
    })();</script>`;
    if(!html.includes('shirli-v49-js')) html=html.replace('</body>',js+'\n</body>');
    const headers=new Headers(res.headers);headers.delete('content-length');return new Response(html,{status:res.status,statusText:res.statusText,headers});
  });
}

self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  e.respondWith(fetch(req,{cache:'no-store'}).then(res=>isHtml(res)?cleanHtml(res):res).catch(()=>caches.match(req)).then(res=>{if(res&&res.status===200&&req.url.startsWith(self.location.origin)){caches.open(CACHE).then(c=>c.put(req,res.clone())).catch(()=>{})}return res}));
});
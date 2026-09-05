/* Shirley app service worker */
const CACHE='shirli-v53';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(xs=>Promise.all(xs.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));

function isHtml(res){return !!res && (res.headers.get('content-type')||'').includes('text/html');}

function cleanHtml(res){
  if(!res.ok||!isHtml(res)) return Promise.resolve(res);
  return res.text().then(html=>{
    const css=`<style id="shirli-v53-css">
      .g-read{display:none!important}

      /* Never show the incorrect generated Shirley logo. */
      .brand-mark,.cover-mark{background-image:url('shirley-logo.png')!important;background-size:cover!important;background-position:center!important}
      #home .home-logo{display:none!important}

      /* The thank-you / entry screen must fit a phone without scrolling. */
      #cover.active{height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;overflow:hidden!important}
      #cover .cover-wrap{height:100%!important;min-height:0!important;max-height:100%!important;padding:14px 16px!important;justify-content:space-evenly!important;gap:6px!important;overflow:hidden!important}
      #cover .cover-mark{display:block!important;width:clamp(104px,28vw,132px)!important;height:clamp(104px,28vw,132px)!important;min-width:0!important;min-height:0!important;margin:0 auto!important;border-radius:50%!important;background-image:url('shirley-logo.png')!important;background-size:cover!important;background-position:center!important}
      #cover .cover-title{font-size:clamp(20px,4.5vh,26px)!important;line-height:1.12!important;margin:0!important}
      #cover .cover-title span{font-size:clamp(15px,3.2vh,18px)!important}
      #cover .cover-thanks{padding:10px 12px!important;margin:0!important}
      #cover .cover-thanks-h{font-size:16px!important;margin-bottom:6px!important}
      #cover .cover-thanks p{font-size:13px!important;line-height:1.3!important;margin:3px 0!important}
      #cover .cover-count{font-size:15px!important;margin:2px 0!important}
      #cover .cover-count b{font-size:18px!important}
      #cover .cover-enter{margin:2px 0!important;padding:10px 28px!important;font-size:15px!important}

      /* Home screen also fits one phone screen. */
      #home.active{height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;overflow:hidden!important;justify-content:flex-start!important}
      #home .topbar{padding:8px 16px 4px!important;min-height:108px!important;flex:0 0 auto!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important}
      #home .home-logo{display:block!important;width:70px!important;height:70px!important;min-width:70px!important;min-height:70px!important;border-radius:50%!important;background:url('shirley-logo.png') center/cover no-repeat!important;box-shadow:0 3px 10px rgba(42,58,71,.16)!important;margin:0 auto!important}
      #home .topbar:after{content:'האוסף של שירלי';font-family:'Varela Round',sans-serif;font-size:17px;color:#244F5E;font-weight:700;text-align:center}
      #home .group{margin:3px 12px!important;padding:5px 8px 6px!important;flex:1 1 0!important;display:flex!important;flex-direction:column!important;justify-content:center!important}
      #home .group-title{font-size:11px!important;margin-bottom:3px!important}
      #home .group-row{gap:6px!important}
      #home .tile{min-height:68px!important;padding:2px!important;gap:2px!important}
      #home .tile .disc{width:47px!important;height:47px!important;border-radius:14px!important}
      #home .tile .disc svg{width:24px!important;height:24px!important}
      #home .tile-label{font-size:12px!important;line-height:1.05!important}
      #home .bottom-row{padding:6px 12px 10px!important;gap:10px!important;flex:1 1 0!important;align-items:center!important}
      #home .group-row{width:100%!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;align-items:center!important}
      #home .g-cards .group-row{grid-template-columns:repeat(2,minmax(0,1fr))!important}

      /* Add page: only image source + book selection remain. */
      #addCard #addBook{font-size:18px!important;min-height:48px!important}

      #cardDetail .fld,#cardDetail .fld-label,#cardDetail .fld-note-label,#cardDetail .note-box,#cardDetail .del-card-btn,#cardDetail .detail-name,#cardDetail .detail-meta,#cardDetail .edit-btn-inline{display:none!important}
      #cardsGrid .detail-name,#cardsGrid .detail-meta,#cardsGrid .card-name,#cardsGrid .card-title,#cardsGrid .thumb-name,#cardsGrid .thumb-title,#cardsGrid .caption,#cardsGrid figcaption{display:none!important}

      /* Slideshow: image fills available space and never uses the old tiny/broken layout. */
      #slideshow{height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;background:#111!important;overflow:hidden!important}
      #slideBody{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;background:#111!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;overflow:hidden!important}
      #slideBody .slide-img{display:block!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain!important;margin:0!important;background:#111!important}
      #slideBody .slide-loading{color:#eee;font-size:14px;opacity:.8}
      .slide-music{z-index:8!important}

      /* Products */
      #products .products-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px 14px 24px}
      #products .product-card{background:rgba(255,255,255,.55);border:1px solid rgba(36,79,94,.14);border-radius:14px;overflow:hidden;box-shadow:0 3px 10px rgba(42,58,71,.11)}
      #products .product-img{height:145px;background:#eadfc9;display:flex;align-items:center;justify-content:center;font-size:38px;overflow:hidden}
      #products .product-img img{width:100%;height:100%;object-fit:cover}
      #products .product-info{text-align:center;padding:8px}.product-name{font-weight:700;color:#244F5E}.product-price{color:#C0673B;font-weight:700;margin-top:3px}.product-cat{font-size:11px;opacity:.7;margin-top:2px}
      #productAdmin{margin-top:20px;border-top:1px solid rgba(36,79,94,.18);padding-top:16px}
    </style>`;
    if(!html.includes('shirli-v53-css')) html=html.replace('</head>',css+'\n</head>');

    /* Music: calm Chopin nocturne, slow fade to 45%. */
    html=html.replace("const MUSIC_SRC='music/beloved.mp3';","const MUSIC_SRC='https://commons.wikimedia.org/wiki/Special:Redirect/file/Nocturne_Op._9_no._2_in_E_flat_major.mp3';");
    html=html.replace('const MUSIC_VOL=0.55;','const MUSIC_VOL=0.45;');
    html=html.replace('const FADE_IN_MS=2000;','const FADE_IN_MS=6000;');

    /* Replace slideshow renderer itself, not only a later override. */
    html=html.replace(
`function renderSlide(){
  const c=slideOrder[slideIdx];
  document.getElementById('slideBody').innerHTML = '<img class="slide-img" src="'+c.img+'">';
}`,
`function renderSlide(){
  const c=slideOrder[slideIdx];
  const body=document.getElementById('slideBody');
  if(!body||!c) return;
  body.innerHTML='<div class="slide-loading">טוען תמונה…</div>';
  const img=new Image();
  img.className='slide-img';
  img.alt='';
  img.onload=function(){ body.innerHTML=''; body.appendChild(img); };
  img.onerror=function(){
    body.innerHTML='<div class="slide-loading">לא ניתן לטעון את דף '+c.no+'</div>';
  };
  img.src=(c.img&&String(c.img).indexOf('data:')===0) ? c.img : ('/shirli/images/'+c.no+'.jpg?v=50');
}`);

    html=html.replace("wideTitle.textContent='דפים לרוחב';","wideTitle.textContent='';");
    html=html.replace("wideTitle.style.display='block';","wideTitle.style.display='none';");
    html=html.replace("wideWrap.appendChild(el);          // move to the wide group","/* Shirley: keep in main list */");
    html=html.replace(/<button class=\"btn secondary\" onclick=\"showGuide\('full'\)\">מדריך מפורט<\/button>/g,'');
    html=html.replace(/האוסף של עירא/g,'האוסף של שירלי').replace(/סול קולאז\\' של עירא/g,'האוסף של שירלי').replace(/אוסף הקולאז\\'ים/g,'אוסף העבודות');

    const js=`<script id="shirli-v50-js">(function(){
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
        if(!document.getElementById('products')){
          let s=document.createElement('div');s.id='products';s.className='screen';
          s.innerHTML='<div class="subhead"><button class="back" onclick="showScreen(\\'home\\')">‹</button><h2>מוצרים</h2></div><div class="products-grid" id="productsGrid"></div>';
          document.querySelector('.app')?.appendChild(s);
        }
        renderProducts();
      }
      function renderProducts(){let g=document.getElementById('productsGrid');if(!g)return;g.innerHTML=read().map(x=>'<div class="product-card"><div class="product-img">'+(x.image?'<img src="'+esc(x.image)+'">':esc(x.emoji||'✨'))+'</div><div class="product-info"><div class="product-name">'+esc(x.name)+'</div>'+(x.price?'<div class="product-price">'+esc(x.price)+' ₪</div>':'')+'<div class="product-cat">'+esc(x.category||'מוצר')+'</div></div></div>').join('')}

      function homeFix(){
        let h=document.getElementById('home');if(!h)return;
        h.querySelectorAll('.tile').forEach(t=>{let l=t.querySelector('.tile-label');if(!l)return;let x=l.textContent.trim();if(x==='שליפת דף')t.style.display='none';if(x==='מצגת הדפים')l.textContent='מצגת העבודות';if(x==='חיפוש דף')l.textContent='חיפוש'});
        let row=h.querySelector('.g-view .group-row');
        if(row&&!h.querySelector('[data-products]')){let b=document.createElement('button');b.className='tile';b.dataset.products='1';b.onclick=()=>{ensureProducts();showScreen('products')};b.innerHTML='<span class="disc" style="--key-base:#D9A441;--key-hi:#F0C56B;--key-lo:#B5842C;--key-edge:#8C641F"><svg viewBox="0 0 24 24" fill="none" stroke="#F3EAD8" stroke-width="1.6"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg></span><span class="tile-label">מוצרים</span>';row.appendChild(b);row.style.gridTemplateColumns='1fr 1fr 1fr'}
      }

      function addPageFix(){
        ['addName','addSuit','addSuitCustomWrap','addNote'].forEach(id=>{
          const el=document.getElementById(id);if(!el)return;
          const field=el.classList.contains('field')?el:el.closest('.field');
          if(field) field.style.display='none';
        });
        const book=document.getElementById('addBook');
        if(book){const f=book.closest('.field');if(f){const lab=f.querySelector('label');if(lab)lab.textContent='ספר';}}

        window.saveNewCard=function(){
          let bookId,b;
          const sel=document.getElementById('addBook');
          if(!sel){ if(typeof tap==='function')tap('לא נמצא ספר'); return; }
          if(sel.value==='__new__'){
            const nm=(document.getElementById('addBookNew')?.value||'').trim();
            if(!nm){ if(typeof tap==='function')tap('נא להזין שם לספר החדש'); return; }
            bookId=books.reduce((m,x)=>Math.max(m,x.id),0)+1;
            const colors=['#C0673B','#244F5E','#D9A441','#8A5A44','#3E6E5E','#B0443B','#6E5A8A','#4A7C8C','#C98A3B','#5E7A44','#A84B6B','#3B5468'];
            b={id:bookId,name:nm,color:colors[(bookId-1)%colors.length],cards:[]};books.push(b);
            try{const cb=JSON.parse(localStorage.getItem(BOOKS_KEY)||'[]');cb.push({id:bookId,name:nm});localStorage.setItem(BOOKS_KEY,JSON.stringify(cb));}catch(e){}
            if(typeof logAction==='function')logAction('נוצר ספר חדש: '+nm);
          }else{
            bookId=parseInt(sel.value,10);b=books.find(x=>x.id===bookId);
          }
          if(!b){ if(typeof tap==='function')tap('נא לבחור ספר'); return; }
          const maxNo=books.reduce((m,bb)=>bb.cards.reduce((n,c)=>Math.max(n,c.no),m),0);
          const card={no:maxNo+1,name:'',note:'',suit:(typeof DEFAULT_SUIT!=='undefined'?DEFAULT_SUIT:''),img:addImgData};
          b.cards.push(card);b.cards.sort((x,y)=>x.no-y.no);
          const saved=persistNewCard(card,b.id);
          undoStack.push({type:'addCard',bookId:b.id,no:card.no});
          if(typeof logAction==='function')logAction('נוסף דף לספר: '+b.name);
          if(typeof renderCounter==='function')renderCounter();
          if(typeof tap==='function')tap(saved?('הדף נוסף לספר '+b.name):'הדף נוסף, אך לא ניתן היה לשמור אותו במכשיר');
          if(typeof showScreen==='function')showScreen('home');
        };
      }

      function adminFix(){
        let s=document.getElementById('settings');if(!s||document.getElementById('productAdmin'))return;
        let host=s.querySelector('.add-form')||s;let box=document.createElement('div');box.id='productAdmin';
        box.innerHTML='<h3>מוצרים למכירה</h3><div class="field"><label>שם מוצר</label><input id="pn"></div><div class="field"><label>קטגוריה</label><input id="pc"></div><div class="field"><label>מחיר ₪</label><input id="pp" type="number"></div><button class="btn clay" id="pa" type="button">הוספת מוצר</button>';
        host.appendChild(box);box.querySelector('#pa').onclick=()=>{let n=box.querySelector('#pn').value.trim();if(!n)return;let a=read();a.push({name:n,category:box.querySelector('#pc').value.trim()||'מוצר',price:box.querySelector('#pp').value.trim(),emoji:'✨'});save(a);box.querySelector('#pn').value='';box.querySelector('#pc').value='';box.querySelector('#pp').value='';renderProducts()};
      }

      document.addEventListener('DOMContentLoaded',()=>{resetShirleyTracking();ensureProducts();homeFix();addPageFix();adminFix();setTimeout(()=>{homeFix();addPageFix()},250)});
      window.addEventListener('load',()=>setTimeout(()=>{homeFix();addPageFix();adminFix()},300));
    })();</script>`;

    if(!html.includes('shirli-v50-js')) html=html.replace('</body>',js+'\n</body>');
    const headers=new Headers(res.headers);headers.delete('content-length');
    return new Response(html,{status:res.status,statusText:res.statusText,headers});
  });
}

self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  e.respondWith(
    fetch(req,{cache:'no-store'})
      .then(res=>isHtml(res)?cleanHtml(res):res)
      .catch(()=>caches.match(req))
      .then(res=>{
        if(res&&res.status===200&&req.url.startsWith(self.location.origin)){
          caches.open(CACHE).then(c=>c.put(req,res.clone())).catch(()=>{});
        }
        return res;
      })
  );
});
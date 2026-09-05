(function(){
  function ensureFolder(){
    let s=document.getElementById('productFolder');
    if(s)return s;
    s=document.createElement('div');
    s.id='productFolder';
    s.className='screen';
    s.innerHTML='<div class="subhead"><button class="back" type="button" aria-label="חזרה">‹</button><h2 id="productFolderTitle">מוצרים</h2></div><div class="products-grid" id="productFolderGrid"></div>';
    document.querySelector('.app')?.appendChild(s);
    s.querySelector('.back').onclick=function(){ showScreen('products'); };
    return s;
  }

  function openFolder(name){
    ensureFolder();
    const t=document.getElementById('productFolderTitle');
    const g=document.getElementById('productFolderGrid');
    t.textContent=name;
    if(name==='תמונות'){
      g.innerHTML='<div class="product-card" id="portraitLink"><div class="product-img"><img src="/shirli/images/30.jpg" alt="דיוקנאות"></div><div class="product-info"><div class="product-name">דיוקנאות</div><div class="product-cat">מעבר לספר הדיוקנאות</div></div></div>';
      document.getElementById('portraitLink').onclick=function(){ if(typeof openBook==='function')openBook(9); };
    }else if(name==='מדבקות'){
      const samples=[['חמור',1],['קרנף',141],['זברה',157]];
      g.innerHTML=samples.map(function(x){return '<div class="product-card"><div class="product-img"><img src="/shirli/images/'+x[1]+'.jpg" alt="'+x[0]+'"></div><div class="product-info"><div class="product-name">'+x[0]+'</div><div class="product-cat">דוגמה למדבקה</div></div></div>';}).join('');
    }else{
      g.innerHTML='';
    }
    showScreen('productFolder');
  }

  function ensureCoverNavigation(){
    const cover=document.getElementById('cover');
    if(!cover||cover.querySelector('.shirli-cover-nav'))return;
    const nav=document.createElement('div');
    nav.className='shirli-cover-nav';
    nav.innerHTML='<button class="shirli-nav-arrow shirli-nav-back" type="button" aria-label="חזרה">←</button><button class="shirli-nav-arrow shirli-nav-next" type="button" aria-label="קדימה">→</button>';
    cover.appendChild(nav);
    nav.querySelector('.shirli-nav-back').onclick=function(e){
      e.stopPropagation();
      const q=new URLSearchParams(location.search);
      const ro=q.get('view')==='1'||q.get('share')==='1';
      location.href=ro?'landing.html?view=1&share=1&stay=1&v=95':'landing.html?stay=1&v=95';
    };
    nav.querySelector('.shirli-nav-next').onclick=function(e){e.stopPropagation();if(typeof showScreen==='function')showScreen('home');};
  }

  document.addEventListener('click',function(e){
    const card=e.target.closest&&e.target.closest('#products .product-card');
    if(!card)return;
    const n=(card.querySelector('.product-name')?.textContent||'').trim();
    if(n==='תמונות'||n==='מדבקות'){
      e.preventDefault();
      e.stopPropagation();
      openFolder(n);
    }
  },true);

  const st=document.createElement('style');
  st.textContent='#productFolder .products-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px 14px 24px}#productFolder .product-card{background:rgba(255,255,255,.55);border:1px solid rgba(36,79,94,.14);border-radius:14px;overflow:hidden;box-shadow:0 3px 10px rgba(42,58,71,.11);cursor:pointer}#productFolder .product-img{height:170px;background:#eadfc9;display:flex;align-items:center;justify-content:center;overflow:hidden}#productFolder .product-img img{width:100%;height:100%;object-fit:contain;background:#fff}#productFolder .product-info{text-align:center;padding:8px}#productFolder .product-name{font-weight:700;color:#244F5E}#productFolder .product-cat{font-size:11px;opacity:.7;margin-top:2px}#productFolder .back{width:48px!important;height:48px!important;min-width:48px!important;min-height:48px!important;font-size:34px!important;display:flex!important;align-items:center!important;justify-content:center!important}#cover .cover-mark{transform:scale(1.10)!important;transform-origin:center!important}#home .topbar{min-height:82px!important;padding:3px 16px 1px!important}#home .home-logo{width:58px!important;height:58px!important;min-width:58px!important;min-height:58px!important;transform:scale(1.10)!important;transform-origin:center!important}.shirli-cover-nav{position:absolute;inset:0;pointer-events:none;z-index:60}.shirli-nav-arrow{position:absolute;top:calc(10px + env(safe-area-inset-top));width:48px;height:48px;border-radius:50%;border:1px solid rgba(36,79,94,.25);background:rgba(255,255,255,.9);color:#244F5E;font-size:30px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(42,58,71,.16);pointer-events:auto;cursor:pointer}.shirli-nav-back{left:14px}.shirli-nav-next{right:14px}@media(max-height:700px){#home .topbar{min-height:80px!important}#home .home-logo{width:56px!important;height:56px!important;min-width:56px!important;min-height:56px!important;transform:scale(1.08)!important}.shirli-nav-arrow{top:calc(6px + env(safe-area-inset-top));width:44px;height:44px;font-size:28px}}';
  document.head.appendChild(st);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureCoverNavigation);else ensureCoverNavigation();
})();
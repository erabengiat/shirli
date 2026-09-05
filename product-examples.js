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
  st.textContent='#productFolder .products-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px 14px 24px}#productFolder .product-card{background:rgba(255,255,255,.55);border:1px solid rgba(36,79,94,.14);border-radius:14px;overflow:hidden;box-shadow:0 3px 10px rgba(42,58,71,.11);cursor:pointer}#productFolder .product-img{height:170px;background:#eadfc9;display:flex;align-items:center;justify-content:center;overflow:hidden}#productFolder .product-img img{width:100%;height:100%;object-fit:contain;background:#fff}#productFolder .product-info{text-align:center;padding:8px}#productFolder .product-name{font-weight:700;color:#244F5E}#productFolder .product-cat{font-size:11px;opacity:.7;margin-top:2px}#productFolder .back{width:48px!important;height:48px!important;min-width:48px!important;min-height:48px!important;font-size:34px!important;display:flex!important;align-items:center!important;justify-content:center!important}';
  document.head.appendChild(st);
})();
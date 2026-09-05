/* Service worker for "האוסף של שירלי" — network first */
const CACHE = 'shirli-v43';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});

function customizeHtml(res) {
  const type = res.headers.get('content-type') || '';
  if (!res.ok || !type.includes('text/html')) return Promise.resolve(res);
  return res.text().then(html => {
    const css = `<style id="shirli-cleanup">
      .g-read{display:none!important;}
    </style>`;
    const js = `<script id="shirli-cleanup-js">
    (function(){
      const GUIDE = [
        ['פתיחה','האוסף של שירלי הוא אוסף דיגיטלי של ספרים ואוספים שיצרה שירלי.'],
        ['הספרים','כניסה לכל ספר או אוסף וצפייה בדפים השייכים אליו.'],
        ['מצגת הדפים','צפייה אוטומטית בדפי האוסף על מסך מלא.'],
        ['חיפוש דף','חיפוש דף לפי שם, מספר או מילה.'],
        ['שליפת דף','בחירה אקראית של דף מתוך האוסף.'],
        ['הוספת דף','הוספת תמונה ודף חדש לספר הרצוי.'],
        ['הגדרות','הוספת ספר חדש וניהול האוסף.'],
        ['עזרה וגיבוי','שמירת גיבוי, שחזור ושיתוף האוסף.'],
        ['צפייה בדף','לחיצה על תמונה פותחת את הדף. כפתור הבית הקטן מחזיר תמיד למסך הראשי.']
      ];
      window.showShirliGuide = function(){
        const box=document.getElementById('guideBox'); if(!box) return;
        box.style.display='block';
        box.innerHTML='<div class="detail-section-label" style="margin-bottom:10px">מדריך קצר</div>'+GUIDE.map(r=>'<div class="g-row"><div class="g-txt"><b>'+r[0]+'</b><br>'+r[1]+'</div></div>').join('');
        box.scrollIntoView({behavior:'smooth',block:'start'});
      };
      function clean(){
        document.querySelectorAll('button').forEach(function(b){
          const t=(b.textContent||'').trim();
          if(t==='מדריך מפורט') b.style.display='none';
          if(t==='מדריך מקוצר' || t==='מדריך קצר'){
            b.textContent='מדריך קצר';
            b.onclick=window.showShirliGuide;
          }
        });
        document.querySelectorAll('button,span,div').forEach(function(el){
          const t=(el.textContent||'').trim();
          if((t==='דפים לרוחב' || t==='דפי רוחב') && !el.querySelector('img')) el.style.display='none';
        });
        const detail=document.getElementById('detailBody');
        if(detail && document.getElementById('cardDetail') && document.getElementById('cardDetail').classList.contains('active')){
          detail.querySelectorAll('*').forEach(function(el){
            if(el.tagName==='IMG' || el.querySelector('img')) return;
            el.style.display='none';
          });
        }
        document.querySelectorAll('.note-box').forEach(function(el){
          if(el.textContent.includes('קריאות שמורות')) el.textContent=el.textContent.replace(/,?\s*קריאות שמורות/g,'');
          if(el.textContent.includes('האוסף של עירא')) el.textContent=el.textContent.replace(/האוסף של עירא/g,'האוסף של שירלי');
        });
      }
      document.addEventListener('DOMContentLoaded',clean);
      new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    })();
    </script>`;
    if(!html.includes('shirli-cleanup')) html=html.replace('</head>',css+'\n'+js+'\n</head>');
    const headers=new Headers(res.headers); headers.delete('content-length');
    return new Response(html,{status:res.status,statusText:res.statusText,headers});
  });
}

self.addEventListener('fetch', e => {
  const req=e.request;
  if(req.method!=='GET') return;
  if(req.url.indexOf('/music/')!==-1){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res&&res.status===200)caches.open(CACHE).then(c=>c.put(req,res.clone())).catch(()=>{});return res;})));
    return;
  }
  e.respondWith(fetch(req).then(res=>{
    const isHtml=req.mode==='navigate'||((res.headers.get('content-type')||'').includes('text/html'));
    return (isHtml?customizeHtml(res):Promise.resolve(res)).then(finalRes=>{
      if(finalRes&&finalRes.status===200&&req.url.startsWith(self.location.origin)) caches.open(CACHE).then(c=>c.put(req,finalRes.clone())).catch(()=>{});
      return finalRes;
    });
  }).catch(()=>caches.match(req)));
});

const CACHE="pig-disease-v23-1-fix";
const VER="23.1";
const CORE=[
  "./",
  "./index.html",
  `./styles.css?v=${VER}`,
  `./app.js?v=${VER}`,
  `./data.js?v=${VER}`,
  `./taiwan_data.js?v=${VER}`,
  `./license_data.js?v=${VER}`,
  `./manifest.webmanifest?v=${VER}`,
  "./offline.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE && k.startsWith("pig-disease-")).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

function isCoreCode(url){
  return /\/(?:app|data|taiwan_data|license_data)\.js$/.test(url.pathname) ||
         /\/styles\.css$/.test(url.pathname) ||
         /\/manifest\.webmanifest$/.test(url.pathname);
}

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;

  // HTML navigation: network first so a new deployment becomes visible immediately.
  if(req.mode==="navigate"){
    event.respondWith(
      fetch(req,{cache:"no-store"}).then(res=>{
        if(res && res.status===200){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put("./index.html",copy));
        }
        return res;
      }).catch(()=>caches.match("./index.html").then(r=>r||caches.match("./offline.html")))
    );
    return;
  }

  // Core JS/CSS/data: network first. This prevents "new HTML + old JS/data" after GitHub deploys.
  if(isCoreCode(url)){
    event.respondWith(
      fetch(req,{cache:"no-store"}).then(res=>{
        if(res && res.status===200){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(req,copy));
        }
        return res;
      }).catch(()=>caches.match(req).then(r=>r||new Response("",{status:504,statusText:"Offline"})))
    );
    return;
  }

  // Images/icons: cache first for speed/offline use.
  event.respondWith(
    caches.match(req).then(cached=>{
      if(cached)return cached;
      return fetch(req).then(res=>{
        if(res && res.status===200){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(req,copy));
        }
        return res;
      }).catch(()=>new Response("",{status:504,statusText:"Offline"}));
    })
  );
});

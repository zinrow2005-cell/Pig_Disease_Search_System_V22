const CACHE="pig-disease-v22";
const CORE=[
  "./","./index.html","./styles.css","./app.js","./data.js",
  "./taiwan_data.js","./license_data.js","./manifest.webmanifest",
  "./offline.html","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-180.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE && k.startsWith("pig-disease-")).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;

  if(req.mode==="navigate"){
    event.respondWith(
      fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(req,copy));
        return res;
      }).catch(()=>caches.match(req).then(r=>r||caches.match("./index.html")).then(r=>r||caches.match("./offline.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>{
      if(cached)return cached;
      return fetch(req).then(res=>{
        if(res && res.status===200){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(req,copy));
        }
        return res;
      }).catch(()=>{
        if(req.destination==="document")return caches.match("./offline.html");
        return new Response("",{status:504,statusText:"Offline"});
      });
    })
  );
});

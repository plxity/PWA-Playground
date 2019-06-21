const staticCacheName = 'site-static-v1';
const DynamicCache = 'site-dynamic-v1'
const assests = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    '/pages/fallback.html'

]

const limitCache = (name,size) => {
    caches.open(name).then(cache=>{
        cache.keys().then(keys =>{
            if(keys.length>size){
                cache.delete(keys[0]).then(limitCache);
            }
        })
    })
}

self.addEventListener('install',evt=>{
    evt.waitUntil(
        caches.open(staticCacheName).then(cache=>{
            cache.addAll(assests);
        })
    )
   
});
self.addEventListener('activate',evt=>{
   evt.waitUntil(
       caches.keys().then(keys=>{
           return Promise.all(keys.filter(key=>key!==staticCacheName && DynamicCache).map(key=>caches.delete(key)))
       })
   )
})
self.addEventListener('fetch',evt=>{
  if(evt.request.url.indexOf('firestore.googleapis.com') === -1){
   evt.respondWith(
       caches.match(evt.request).then(cacheres=>{
           return cacheres || fetch(evt.request).then(fetchRes=>{
               return caches.open(DynamicCache).then(cache=>{
                   cache.put(evt.request.url,fetchRes.clone());
                   limitCache(DynamicCache,3);
                   return fetchRes;
               })
           })
       }).catch(()=>{
           if(evt.request.url.indexOf('.html')>-1){
           return caches.match('/pages/fallback.html')
           }
       })
   )
}})
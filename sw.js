// Service worker simples: guarda a página para abrir mais rápido; os dados sempre vêm do Supabase.
// Busca sempre a versão nova na rede primeiro, então correções chegam às duas unidades sem precisar mexer aqui.
const CACHE = "presenca-v3";
const ARQUIVOS = ["./", "./icon-192.png", "./icon-512.png", "./core/app.css", "./core/app.js", "./unidades/unidades.js",
  "./picos/", "./picos/manifest.json", "./boulevard/", "./boulevard/manifest.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // Supabase e CDN: sempre direto da rede
  e.respondWith(fetch(e.request, {cache: "no-cache"}).then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; }).catch(() => caches.match(e.request)));
});

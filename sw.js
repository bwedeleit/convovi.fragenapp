// Convovi Fragen — Service Worker (v3)
// Wichtig: nur EIGENE Dateien (gleiche Herkunft) behandeln.
// Fremd-Anfragen (Supabase, esm.sh, Google Fonts) werden NICHT abgefangen,
// damit sie normal geladen werden und keine "Returned response is null"-
// oder CORS-Fehler entstehen.

const CACHE = 'convovi-fragen-v3';
const CORE = ['/', '/manifest.json', '/icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Nur GET-Anfragen zur EIGENEN Domain behandeln.
  // Alles andere (POST, Supabase, esm.sh, Fonts) unangetastet durchlassen.
  let sameOrigin = false;
  try { sameOrigin = new URL(req.url).origin === self.location.origin; } catch (_) {}
  if (req.method !== 'GET' || !sameOrigin) return;

  // Netzwerk zuerst, Cache als Fallback — und NIE null zurückgeben.
  e.respondWith(
    fetch(req)
      .then((res) => res)
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        const shell = await caches.match('/');
        if (shell) return shell;
        return new Response('', { status: 504, statusText: 'Offline' });
      })
  );
});

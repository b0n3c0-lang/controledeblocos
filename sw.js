// Service Worker do Controle de Blocos (FonTech)
// IMPORTANTE: aumente o número da versão (v1 -> v2 -> v3...) toda vez que
// publicar uma atualização do app no GitHub. Isso garante que o cache antigo
// seja descartado e todo mundo receba a versão nova.
const CACHE_NAME = 'controle-blocos-v1';

const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Limpa caches de versões antigas (evita acumular lixo e servir arquivo velho por engano)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(nomes =>
            Promise.all(nomes.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
        )
    );
    self.clients.claim();
});

// Estratégia:
// - Navegação (abrir/recarregar o app): tenta a REDE primeiro, pra sempre pegar
//   a versão mais nova do index.html. Só usa o cache se estiver offline.
// - Outros arquivos (fontes, bibliotecas): cache primeiro, já que raramente mudam.
self.addEventListener('fetch', event => {
    const isNavegacao = event.request.mode === 'navigate';

    if (isNavegacao) {
        event.respondWith(
            fetch(event.request)
                .then(resposta => {
                    const copia = resposta.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia));
                    return resposta;
                })
                .catch(() => caches.match('./index.html'))
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(resposta => resposta || fetch(event.request))
        );
    }
});

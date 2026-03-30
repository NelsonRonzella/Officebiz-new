// Service Worker — online only com suporte a Web Push

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()))

// Todas as requisições vão direto para a rede (sem cache offline)
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request))
})

// Exibe a notificação push quando recebida do servidor
self.addEventListener('push', (event) => {
    if (!event.data) return

    const data = event.data.json()

    event.waitUntil(
        self.registration.showNotification(data.title ?? 'Officebiz', {
            body:  data.body  ?? '',
            icon:  data.icon  ?? '/icons/web-app-manifest-192x192.png',
            badge: '/icons/web-app-manifest-192x192.png',
            data:  data.data  ?? {},
        })
    )
})

// Abre a URL do pedido ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    const url = event.notification.data?.url ?? '/'

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Se já tem uma aba aberta, foca e navega
            for (const client of windowClients) {
                if ('focus' in client) {
                    client.focus()
                    client.navigate(url)
                    return
                }
            }
            // Senão abre uma nova aba
            return clients.openWindow(url)
        })
    )
})

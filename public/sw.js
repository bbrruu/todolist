// Service Worker for PWA + Push Notifications

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// Handle push notifications
self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? {}

  // Discard stale notifications queued while offline (older than 20 hours)
  if (data.sentAt && Date.now() - data.sentAt > 20 * 60 * 60 * 1000) return

  const title = data.title ?? '我的事項'
  const options = {
    body: data.body ?? '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag ?? 'todolist',
    renotify: true,
    data: { url: data.url ?? '/' },
  }
  e.waitUntil(self.registration.showNotification(title, options))
})

// Click on notification → open app
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = e.notification.data?.url ?? '/'
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => c.url === url && 'focus' in c)
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})

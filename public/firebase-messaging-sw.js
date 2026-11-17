/* Service worker do push na web (FCM). A config pública do Firebase vem na
 * query string do registro (ver src/lib/web-push.ts). */
/* global importScripts, firebase, clients */
importScripts('https://www.gstatic.com/firebasejs/12.10.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging-compat.js')

const params = new URL(self.location.href).searchParams
firebase.initializeApp({
  apiKey: params.get('apiKey'),
  projectId: params.get('projectId'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
})
const messaging = firebase.messaging()

// Mensagem com `notification` o navegador já exibe sozinho em segundo plano;
// aqui só garantimos que `data` siga junto para o clique.
messaging.onBackgroundMessage(() => {})

/** Rota do app (data.route) -> página da web. */
function webPath(route) {
  if (typeof route !== 'string' || !route.startsWith('/')) return '/'
  if (route.startsWith('/notice/')) return '/membro/avisos'
  const map = {
    '/agenda': '/membro/calendario',
    '/devo': '/membro/financeiro',
    '/charges': '/membro/cobrancas',
    '/store': '/membro/cantina',
    '/notifications': '/membro',
  }
  return map[route] || '/membro'
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const data = (event.notification.data && (event.notification.data.FCM_MSG?.data || event.notification.data)) || {}
  // Admin cai em /membro e o layout redireciona para /admin.
  const url = new URL(webPath(data.route), self.location.origin).href
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) {
          c.navigate(url)
          return c.focus()
        }
      }
      return clients.openWindow(url)
    }),
  )
})

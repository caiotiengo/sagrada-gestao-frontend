'use client'

import app, { USE_EMULATORS } from './firebase'
import { notificationsService } from '@/services/notifications'

/**
 * Push na web via FCM (Firebase Cloud Messaging).
 *
 * Só liga quando há chave VAPID (NEXT_PUBLIC_FIREBASE_VAPID_KEY), fora dos
 * emuladores (FCM não tem emulador) e em navegador com Service Worker e Push.
 * Sem isso, a tela de preferências mostra o motivo e o resto segue normal.
 */

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ''
const TOKEN_KEY = 'sg-web-push-token'

export type WebPushStatus =
  | { available: true }
  | { available: false; reason: string }

export async function webPushStatus(): Promise<WebPushStatus> {
  if (typeof window === 'undefined') return { available: false, reason: 'Indisponível fora do navegador.' }
  if (!VAPID_KEY) return { available: false, reason: 'Push no navegador ainda não foi configurado (falta a chave VAPID).' }
  if (USE_EMULATORS) return { available: false, reason: 'Push no navegador fica desligado com os emuladores.' }
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    return { available: false, reason: 'Este navegador não suporta notificações.' }
  }
  const { isSupported } = await import('firebase/messaging')
  if (!(await isSupported().catch(() => false))) {
    return { available: false, reason: 'Este navegador não suporta notificações push.' }
  }
  return { available: true }
}

export function browserPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

/** Config pública do Firebase vai na URL do SW (ele não lê variáveis de ambiente). */
function swUrl() {
  const o = app.options
  const q = new URLSearchParams({
    apiKey: o.apiKey ?? '',
    projectId: o.projectId ?? '',
    messagingSenderId: o.messagingSenderId ?? '',
    appId: o.appId ?? '',
  })
  return `/firebase-messaging-sw.js?${q.toString()}`
}

/**
 * Pede permissão (tem que vir de um clique), obtém o token FCM e registra no
 * back. Com `silent`, não pede permissão: só renova se já foi concedida.
 */
export async function enableWebPush({ silent = false } = {}): Promise<{ ok: boolean; message?: string }> {
  const status = await webPushStatus()
  if (!status.available) return { ok: false, message: status.reason }

  if (Notification.permission !== 'granted') {
    if (silent) return { ok: false }
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return { ok: false, message: 'Permissão negada no navegador.' }
  }

  try {
    const { getMessaging, getToken } = await import('firebase/messaging')
    const registration = await navigator.serviceWorker.register(swUrl(), { scope: '/firebase-cloud-messaging-push-scope' })
    const token = await getToken(getMessaging(app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration })
    if (!token) return { ok: false, message: 'Não foi possível obter o token do navegador.' }
    await notificationsService.registerPushToken({ token, provider: 'fcm', platform: 'web', deviceName: navigator.userAgent.slice(0, 100) })
    localStorage.setItem(TOKEN_KEY, token)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: (error as Error)?.message || 'Falha ao ativar notificações.' }
  }
}

/** Logout: tira o token deste navegador (antes de sair do Firebase Auth). */
export async function disableWebPush(): Promise<void> {
  let token: string | null = null
  try {
    token = localStorage.getItem(TOKEN_KEY)
  } catch {
    return
  }
  if (!token) return
  try {
    await Promise.race([
      notificationsService.unregisterPushToken({ token }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
    ])
  } catch {
    // Sem rede: o token some quando o FCM disser que é inválido.
  }
  try {
    const { getMessaging, deleteToken } = await import('firebase/messaging')
    await deleteToken(getMessaging(app))
  } catch {
    // ignora: navegador sem suporte ou SW já removido
  }
  localStorage.removeItem(TOKEN_KEY)
}

export function isWebPushEnabledHere(): boolean {
  try {
    return !!localStorage.getItem(TOKEN_KEY)
  } catch {
    return false
  }
}

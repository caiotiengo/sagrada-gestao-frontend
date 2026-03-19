import { logEvent, setUserId, setUserProperties } from 'firebase/analytics'
import { getAnalyticsInstance } from './firebase'

function getAnalytics() {
  return getAnalyticsInstance()
}

// ---- User identification ----

export function identifyUser(userId: string, properties?: Record<string, string>) {
  const analytics = getAnalytics()
  if (!analytics) return
  setUserId(analytics, userId)
  if (properties) {
    setUserProperties(analytics, properties)
  }
}

export function clearUser() {
  const analytics = getAnalytics()
  if (!analytics) return
  setUserId(analytics, '')
}

// ---- Custom events ----

export function trackEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  const analytics = getAnalytics()
  if (!analytics) return
  logEvent(analytics, eventName, params)
}

// ---- Auth events ----

export function trackLogin(method: string) {
  trackEvent('login', { method })
}

export function trackSignUp(method: string) {
  trackEvent('sign_up', { method })
}

export function trackLogout() {
  trackEvent('logout')
  clearUser()
}

// ---- Financial events ----

export function trackPayment(category: string, amount: number, type: 'income' | 'expense') {
  trackEvent('payment_created', { category, amount, type })
}

export function trackFeePayment(amount: number, method: string) {
  trackEvent('fee_paid', { amount, method })
}

export function trackDebtPayment(amount: number) {
  trackEvent('debt_paid', { amount })
}

// ---- Public site events ----

export function trackContribution(campaignSlug: string, amount: number) {
  trackEvent('contribution', { campaign: campaignSlug, amount })
}

export function trackRaffleReservation(raffleSlug: string, numbersCount: number, amount: number) {
  trackEvent('raffle_reservation', { raffle: raffleSlug, numbers_count: numbersCount, amount })
}

export function trackStoreOrder(itemCount: number, total: number) {
  trackEvent('store_order', { item_count: itemCount, total })
}

// ---- Navigation events ----

export function trackScreenView(screenName: string) {
  trackEvent('screen_view', { screen_name: screenName })
}

// ---- Error tracking ----

export function trackError(errorMessage: string, source?: string) {
  trackEvent('app_error', {
    error_message: errorMessage.slice(0, 100),
    error_source: source || 'unknown',
  })
}

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    trackError(event.message, 'uncaught_error')
  })

  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason)
    trackError(message, 'unhandled_promise')
  })
}

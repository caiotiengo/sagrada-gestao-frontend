import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getAnalytics, isSupported } from 'firebase/analytics'
import type { Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

export const USE_EMULATORS = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true'

const EMULATOR_HOST = process.env.NEXT_PUBLIC_EMULATOR_HOST || 'localhost'
const AUTH_EMULATOR_PORT = Number(process.env.NEXT_PUBLIC_AUTH_EMULATOR_PORT) || 9099
const FUNCTIONS_EMULATOR_PORT = Number(process.env.NEXT_PUBLIC_FUNCTIONS_EMULATOR_PORT) || 5001

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const functions = getFunctions(app, 'southamerica-east1')

// Analytics — only in browser (not SSR) and never against emulators
// (com emuladores os eventos iriam para o measurementId real).
let analyticsInstance: Analytics | null = null

export function getAnalyticsInstance(): Analytics | null {
  return analyticsInstance
}

if (typeof window !== 'undefined' && !USE_EMULATORS && firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app)
    }
  })
}

if (USE_EMULATORS) {
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`, { disableWarnings: true })
  connectFunctionsEmulator(functions, EMULATOR_HOST, FUNCTIONS_EMULATOR_PORT)
}

export default app

import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { callFunction } from '@/lib/callable'
import { identifyUser, trackLogin, trackSignUp, trackLogout } from '@/lib/analytics'
import type {
  LoginResponse,
  RegisterHouseRequest,
  RegisterHouseResponse,
  RequestPasswordResetRequest,
} from '@/types'

export const authService = {
  /**
   * Login: Firebase Auth SDK for token, then callable for profile data.
   * The login callable uses the auth token — no payload needed.
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    await signInWithEmailAndPassword(auth, email, password)
    const data = await callFunction<Record<string, never>, LoginResponse>('login', {})
    identifyUser(data.uid, { role: data.houses?.[0]?.role || 'unknown' })
    trackLogin('email')
    return data
  },

  /**
   * Register primary admin + create house.
   * Creates Firebase Auth user first, then calls the cloud function.
   * Email/password are used only for createUserWithEmailAndPassword —
   * the callable gets the UID from the auth token.
   */
  registerHouse: async (
    data: RegisterHouseRequest & { email: string; password: string }
  ): Promise<RegisterHouseResponse> => {
    const { email, password, ...payload } = data

    // Create Firebase Auth user first
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // Ensure the ID token is ready before calling the cloud function
    await userCredential.user.getIdToken()

    // Call the cloud function (Firebase SDK sends the auth token automatically)
    const result = await callFunction<RegisterHouseRequest, RegisterHouseResponse>(
      'registerHouse',
      payload
    )
    identifyUser(userCredential.user.uid, { role: 'admin' })
    trackSignUp('email')
    return result
  },

  /**
   * Request password reset email.
   */
  requestPasswordReset: async (data: RequestPasswordResetRequest): Promise<void> => {
    await sendPasswordResetEmail(auth, data.email)
  },

  /**
   * Get profile data for the logged-in user.
   * The login callable uses the auth token — no payload needed.
   */
  getProfile: async (): Promise<LoginResponse> => {
    if (!auth.currentUser) throw new Error('Not authenticated')
    return callFunction<Record<string, never>, LoginResponse>('login', {})
  },

  /**
   * Sign out.
   */
  logout: async (): Promise<void> => {
    trackLogout()
    await signOut(auth)
  },
}

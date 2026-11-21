import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { callFunction } from '@/lib/callable'
import { getErrorCode } from '@/lib/errors'
import { RegistrationError, withRegistrationAccount } from '@/lib/auth-account'
import { identifyUser, trackLogin, trackSignUp, trackLogout } from '@/lib/analytics'
import { getFreshStoredProfile } from '@/stores/auth'
import type {
  HouseMembership,
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
    let data: LoginResponse
    try {
      data = await callFunction<Record<string, never>, LoginResponse>('login', {})
    } catch (error) {
      // Conta existe no Auth mas sem perfil (cadastro que não terminou)
      await signOut(auth).catch(() => undefined)
      if (getErrorCode(error) === 'functions/not-found') {
        throw new RegistrationError(
          'Seu cadastro não foi concluído. Abra de novo o link de convite (ou o cadastro da casa) e use este mesmo e-mail e senha.',
        )
      }
      throw error
    }
    if (!data.houses?.length) {
      await signOut(auth).catch(() => undefined)
      throw new RegistrationError(
        'Sua conta não está vinculada a nenhuma casa ativa. Se o seu acesso foi desativado, peça à liderança da casa para reativá-lo.',
      )
    }
    identifyUser(data.uid, { role: data.houses?.[0]?.role || 'unknown' })
    trackLogin('email')
    return data
  },

  /**
   * Register primary admin + create house.
   * Creates (or signs into) the Firebase Auth user, then calls the cloud
   * function; on failure the account created here is deleted.
   * Email/password are used only for createUserWithEmailAndPassword —
   * the callable gets the UID from the auth token.
   */
  registerHouse: async (
    data: RegisterHouseRequest & { email: string; password: string }
  ): Promise<RegisterHouseResponse> => {
    const { email, password, ...payload } = data

    // Cria (ou reaproveita) a conta do Auth; se o callable falhar, desfaz.
    return withRegistrationAccount(email, password, async (user) => {
      const result = await callFunction<RegisterHouseRequest, RegisterHouseResponse>(
        'registerHouse',
        payload
      )
      identifyUser(user.uid, { role: 'admin' })
      trackSignUp('email')
      return result
    })
  },

  /**
   * Request password reset email.
   */
  requestPasswordReset: async (data: RequestPasswordResetRequest): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, data.email)
    } catch (error) {
      // Não revela se o e-mail tem conta: "não encontrado" responde igual ao sucesso.
      const code = getErrorCode(error)
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') return
      throw error
    }
  },

  /**
   * Get profile data for the logged-in user.
   * Com perfil salvo e recente neste navegador, atualiza só as casas (papel,
   * permissões, bloqueio) via `listMyHouses`, como o app: mais rápido e sem
   * gravar auditoria de LOGIN a cada abertura. Sem perfil salvo, usa `login`.
   */
  getProfile: async (): Promise<LoginResponse> => {
    const user = auth.currentUser
    if (!user) throw new Error('Not authenticated')
    const stored = getFreshStoredProfile(user.uid)
    if (stored) {
      const { houses } = await callFunction<Record<string, never>, { houses: HouseMembership[] }>('listMyHouses', {})
      return { ...stored, houses }
    }
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

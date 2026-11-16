import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getErrorCode } from '@/lib/errors'

/**
 * Conta do Firebase Auth para um cadastro (casa nova ou convite).
 *
 * - E-mail novo: cria a conta; se o callable de cadastro falhar, a conta é
 *   apagada (não fica conta órfã no Auth sem perfil).
 * - E-mail que já tem conta: entra com a senha informada e segue o cadastro
 *   (o back aceita quem já tem conta, ex.: entrar numa segunda casa por convite
 *   ou concluir um cadastro que falhou antes). Se falhar, só sai da sessão.
 */
export async function withRegistrationAccount<T>(
  email: string,
  password: string,
  register: (user: User) => Promise<T>,
): Promise<T> {
  let user: User
  let createdNow = false
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    user = cred.user
    createdNow = true
  } catch (error) {
    if (getErrorCode(error) !== 'auth/email-already-in-use') throw error
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      user = cred.user
    } catch {
      throw new RegistrationError(
        'Este e-mail já tem conta. Use a senha dessa conta ou entre pela tela de login.',
      )
    }
  }

  try {
    // Garante o token antes de chamar a function
    await user.getIdToken()
    return await register(user)
  } catch (error) {
    if (createdNow) {
      await deleteUser(user).catch(() => signOut(auth).catch(() => undefined))
    } else {
      await signOut(auth).catch(() => undefined)
    }
    throw error
  }
}

/** Erro com mensagem pronta para o usuário (exibida pelo getErrorMessage). */
export class RegistrationError extends Error {
  code = 'functions/failed-precondition'
  constructor(message: string) {
    super(message)
    this.name = 'RegistrationError'
  }
}

import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { callFunction } from '@/lib/callable'

/** Palavra que a pessoa digita para confirmar (igual à do back). */
export const DELETE_ACCOUNT_CONFIRMATION = 'EXCLUIR'

export interface DeleteMyAccountResponse {
  deleted: true
  alreadyDeleted: boolean
  membershipsDeactivated: number
  housesDeactivated: string[]
  ownershipTransferred: Array<{ houseId: string; newOwnerId: string }>
}

export const accountService = {
  /**
   * Exclui a conta do usuário logado. O back exige login recente: antes,
   * confirma a senha (reautentica) e pega um token novo.
   */
  deleteMyAccount: async (password: string): Promise<DeleteMyAccountResponse> => {
    const user = auth.currentUser
    if (!user?.email) throw Object.assign(new Error('Sessão expirada. Entre de novo.'), { code: 'auth/no-current-user' })
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password))
    await user.getIdToken(true)
    return callFunction<{ confirm: string }, DeleteMyAccountResponse>('deleteMyAccount', {
      confirm: DELETE_ACCOUNT_CONFIRMATION,
    })
  },
}

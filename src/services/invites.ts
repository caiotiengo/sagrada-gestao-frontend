import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { callFunction } from '@/lib/callable'
import type {
  ValidateInviteRequest,
  ValidateInviteResponse,
  RegisterByInviteRequest,
  RegisterByInviteResponse,
  CreateInviteRequest,
  CreateInviteResponse,
  RevokeInviteRequest,
  ListInvitesRequest,
  InviteItem,
  PaginatedResponse,
} from '@/types'

export const invitesService = {
  validateInvite: (data: ValidateInviteRequest) =>
    callFunction<ValidateInviteRequest, ValidateInviteResponse>('validateInvite', data),

  /**
   * Register via invite. Creates Firebase Auth user first,
   * then calls the callable (email/password stripped — UID comes from auth token).
   */
  registerByInvite: async (
    data: RegisterByInviteRequest & { email: string; password: string }
  ): Promise<RegisterByInviteResponse> => {
    const { email, password, ...payload } = data

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // Ensure the ID token is ready before calling the cloud function
    await userCredential.user.getIdToken()

    return callFunction<RegisterByInviteRequest, RegisterByInviteResponse>(
      'registerByInvite',
      payload
    )
  },

  createInvite: (data: CreateInviteRequest) =>
    callFunction<CreateInviteRequest, CreateInviteResponse>('createInvite', data),

  revokeInvite: (data: RevokeInviteRequest) =>
    callFunction<RevokeInviteRequest, { revoked: true }>('revokeInvite', data),

  listInvites: (data: ListInvitesRequest) =>
    callFunction<ListInvitesRequest, PaginatedResponse<InviteItem>>('listInvites', data),
}

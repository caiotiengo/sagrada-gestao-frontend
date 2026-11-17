import { callFunction } from '@/lib/callable'

export type PixKeyType = 'cpf' | 'cnpj' | 'phone' | 'email' | 'random'

export interface HousePaymentInfo {
  pixKey: string
  pixKeyType: PixKeyType
  receiverName: string | null
}

interface MemberContext {
  house?: { id: string; name: string; paymentInfo: HousePaymentInfo | null } | null
}

export const housePaymentService = {
  /** Lê `house.paymentInfo` (mesmo dado que o app mostra para os membros). */
  getPaymentInfo: async (houseId: string) => {
    const ctx = await callFunction<{ houseId: string }, MemberContext>('getMyMemberContext', { houseId })
    return ctx.house?.paymentInfo ?? null
  },

  /** pixKey vazio remove a chave. */
  update: (data: { houseId: string; pixKey: string; pixKeyType?: PixKeyType; receiverName?: string }) =>
    callFunction<typeof data, { houseId: string; paymentInfo: HousePaymentInfo | null }>('updateHousePaymentInfo', data),
}

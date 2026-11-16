import { callFunction } from '@/lib/callable'
import type {
  MemberCharge,
  CreateMemberChargeRequest,
  ListMemberChargesRequest,
  MemberChargeActionRequest,
  RejectMemberChargeRequest,
  PayMemberChargeRequest,
  PaginatedResponse,
} from '@/types'

type ChargeStatusResponse = { chargeId: string; status: string }

export const memberChargesService = {
  createMemberCharge: (data: CreateMemberChargeRequest) =>
    callFunction<CreateMemberChargeRequest, { chargeIds: string[]; chargesCreated: number; amount: number }>('createMemberCharge', data),

  listMemberCharges: (data: ListMemberChargesRequest) =>
    callFunction<ListMemberChargesRequest, PaginatedResponse<MemberCharge>>('listMemberCharges', data),

  acceptMemberCharge: (data: MemberChargeActionRequest) =>
    callFunction<MemberChargeActionRequest, ChargeStatusResponse>('acceptMemberCharge', data),

  rejectMemberCharge: (data: RejectMemberChargeRequest) =>
    callFunction<RejectMemberChargeRequest, ChargeStatusResponse>('rejectMemberCharge', data),

  payMemberCharge: (data: PayMemberChargeRequest) =>
    callFunction<PayMemberChargeRequest, ChargeStatusResponse>('payMemberCharge', data),

  cancelMemberCharge: (data: MemberChargeActionRequest) =>
    callFunction<MemberChargeActionRequest, ChargeStatusResponse>('cancelMemberCharge', data),
}

import { callFunction } from '@/lib/callable'
import type {
  ListMembersRequest,
  MemberItem,
  GetMemberDetailsRequest,
  MemberDetails,
  UpdateMemberPermissionsRequest,
  SetMemberActiveRequest,
  SetMemberActiveResponse,
  PaginatedResponse,
  ChangeMemberRoleRequest,
  ChangeMemberRoleResponse,
  TransferHouseOwnershipRequest,
  TransferHouseOwnershipResponse,
} from '@/types'

export const membersService = {
  listMembers: (data: ListMembersRequest) =>
    callFunction<ListMembersRequest, PaginatedResponse<MemberItem>>('listMembers', data),

  getMemberDetails: (data: GetMemberDetailsRequest) =>
    callFunction<GetMemberDetailsRequest, MemberDetails>('getMemberDetails', data),

  updateMemberPermissions: (data: UpdateMemberPermissionsRequest) =>
    callFunction<UpdateMemberPermissionsRequest, { message: string }>('updateMemberPermissions', data),

  deactivateMember: (data: SetMemberActiveRequest) =>
    callFunction<SetMemberActiveRequest, SetMemberActiveResponse>('deactivateMember', data),

  reactivateMember: (data: SetMemberActiveRequest) =>
    callFunction<SetMemberActiveRequest, SetMemberActiveResponse>('reactivateMember', data),

  changeMemberRole: (data: ChangeMemberRoleRequest) =>
    callFunction<ChangeMemberRoleRequest, ChangeMemberRoleResponse>('changeMemberRole', data),

  transferHouseOwnership: (data: TransferHouseOwnershipRequest) =>
    callFunction<TransferHouseOwnershipRequest, TransferHouseOwnershipResponse>('transferHouseOwnership', data),
}

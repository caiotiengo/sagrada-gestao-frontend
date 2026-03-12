import { callFunction } from '@/lib/callable'
import type {
  ListMembersRequest,
  MemberItem,
  GetMemberDetailsRequest,
  MemberDetails,
  UpdateMemberPermissionsRequest,
  PaginatedResponse,
} from '@/types'

export const membersService = {
  listMembers: (data: ListMembersRequest) =>
    callFunction<ListMembersRequest, PaginatedResponse<MemberItem>>('listMembers', data),

  getMemberDetails: (data: GetMemberDetailsRequest) =>
    callFunction<GetMemberDetailsRequest, MemberDetails>('getMemberDetails', data),

  updateMemberPermissions: (data: UpdateMemberPermissionsRequest) =>
    callFunction<UpdateMemberPermissionsRequest, { message: string }>('updateMemberPermissions', data),
}

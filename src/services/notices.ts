import { callFunction } from '@/lib/callable'
import type {
  NoticeItem,
  CreateNoticeRequest,
  UpdateNoticeRequest,
  ListNoticesRequest,
  DeleteNoticeRequest,
  GetCommunityFeedRequest,
  CommunityFeed,
  PaginatedResponse,
} from '@/types'

export const noticesService = {
  createNotice: (data: CreateNoticeRequest) =>
    callFunction<CreateNoticeRequest, { noticeId: string; title: string }>('createNotice', data),

  updateNotice: (data: UpdateNoticeRequest) =>
    callFunction<UpdateNoticeRequest, { noticeId: string; updated: boolean }>('updateNotice', data),

  listNotices: (data: ListNoticesRequest) =>
    callFunction<ListNoticesRequest, PaginatedResponse<NoticeItem>>('listNotices', data),

  deleteNotice: (data: DeleteNoticeRequest) =>
    callFunction<DeleteNoticeRequest, { noticeId: string; deleted: boolean }>('deleteNotice', data),

  getCommunityFeed: (data: GetCommunityFeedRequest) =>
    callFunction<GetCommunityFeedRequest, CommunityFeed>('getCommunityFeed', data),
}

import { callFunction } from '@/lib/callable'
import type {
  CreateCampaignRequest,
  CampaignItem,
  UpdateCampaignRequest,
  ListCampaignsRequest,
  AssignQuotaRequest,
  AssignQuotaWithPixRequest,
  AssignQuotaWithPixResponse,
  QuotaPaymentStatusResponse,
  PayQuotaRequest,
  RegisterExternalContributionRequest,
  UpdateContributionStatusRequest,
  DeleteCampaignRequest,
  ListQuotasRequest,
  QuotaItem,
  ListCampaignContributionsRequest,
  CampaignContributionItem,
  PaginatedResponse,
} from '@/types'

export const campaignsService = {
  createCampaign: (data: CreateCampaignRequest) =>
    callFunction<CreateCampaignRequest, CampaignItem>('createCampaign', data),

  updateCampaign: (data: UpdateCampaignRequest) =>
    callFunction<UpdateCampaignRequest, CampaignItem>('updateCampaign', data),

  listCampaigns: (data: ListCampaignsRequest) =>
    callFunction<ListCampaignsRequest, PaginatedResponse<CampaignItem>>('listCampaigns', data),

  assignQuota: (data: AssignQuotaRequest) =>
    callFunction<AssignQuotaRequest, QuotaItem>('assignQuota', data),

  assignQuotaWithPix: (data: AssignQuotaWithPixRequest) =>
    callFunction<AssignQuotaWithPixRequest, AssignQuotaWithPixResponse>('assignQuotaWithPix', data),

  getQuotaPaymentStatus: (data: { quotaId: string }) =>
    callFunction<{ quotaId: string }, QuotaPaymentStatusResponse>('getQuotaPaymentStatus', data),

  payQuota: (data: PayQuotaRequest) =>
    callFunction<PayQuotaRequest, QuotaItem>('payQuota', data),

  registerExternalContribution: (data: RegisterExternalContributionRequest) =>
    callFunction<RegisterExternalContributionRequest, { message: string }>('registerExternalContribution', data),

  updateContributionStatus: (data: UpdateContributionStatusRequest) =>
    callFunction<UpdateContributionStatusRequest, { message: string }>('updateContributionStatus', data),

  deleteCampaign: (data: DeleteCampaignRequest) =>
    callFunction<DeleteCampaignRequest, { message: string }>('deleteCampaign', data),

  listQuotas: (data: ListQuotasRequest) =>
    callFunction<ListQuotasRequest, PaginatedResponse<QuotaItem>>('listQuotas', data),

  listCampaignContributions: (data: ListCampaignContributionsRequest) =>
    callFunction<ListCampaignContributionsRequest, PaginatedResponse<CampaignContributionItem>>('listCampaignContributions', data),
}

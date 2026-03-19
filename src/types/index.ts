// ========================================
// Sagrada Gestão — Types (Firebase API)
// ========================================

// ---- Profiles & Permissions ----

export type UserRole = 'admin' | 'filho_de_santo'

export type ExtraPermission =
  | 'canManageCashier'
  | 'canRegisterSales'
  | 'canRegisterInternalPayments'
  | 'canManageMembers'
  | 'canManageCalendar'
  | 'canManageCampaigns'
  | 'canManageRaffles'
  | 'canManageJobs'
  | 'canManageGames'

// ---- Auth ----

export interface LoginResponse {
  uid: string
  fullName: string
  email: string
  phone: string
  photoUrl: string | null
  houses: HouseMembership[]
}

export interface HouseMembership {
  memberId: string
  houseId: string
  houseSlug: string | null
  houseName: string | null
  role: UserRole
  extraPermissions: ExtraPermission[]
}

export interface RegisterHouseRequest {
  fullName: string
  phone: string
  alternatePhone?: string
  documentType: 'CPF' | 'CNPJ'
  documentNumber: string
  houseName: string
  houseDisplayName: string
  houseAddress: string
  houseDaysOfGira: string[]
  houseContactNumbers: string[]
}

export interface RegisterHouseResponse {
  uid: string
  houseId: string
  houseSlug: string
  email: string
  fullName: string
  role: 'admin'
  memberId: string
}

export interface RequestPasswordResetRequest {
  email: string
}

// ---- Invites ----

export type InviteType = 'member' | 'admin'
export type InviteStatus = 'active' | 'used' | 'expired' | 'revoked'

export interface CreateInviteRequest {
  houseId: string
  inviteType: InviteType
  maxUses?: number
  expiresInHours?: number
  permissionsTemplate?: ExtraPermission[]
}

export interface CreateInviteResponse {
  inviteId: string
  token: string
  invitePath: string
  inviteType: string
  maxUses: number
  expiresInHours: number
}

export interface ValidateInviteRequest {
  token: string
  houseSlug: string
}

export interface ValidateInviteResponse {
  valid: true
  inviteId: string
  inviteType: InviteType
  houseId: string
  houseName: string
  houseSlug: string
  preFilledRole: string
  permissionsTemplate: ExtraPermission[]
}

export interface RegisterByInviteRequest {
  token: string
  houseSlug: string
  fullName: string
  phone: string
  cpf?: string
  rg?: string
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  emergencyContactName?: string
  emergencyContactPhone?: string
}

export interface RegisterByInviteResponse {
  uid: string
  houseId: string
  houseSlug: string
  email: string
  fullName: string
  role: UserRole
  memberId: string
}

export interface RevokeInviteRequest {
  houseId: string
  inviteId: string
}

export interface ListInvitesRequest {
  houseId: string
  status?: InviteStatus
  page?: number
  limit?: number
}

export interface InviteItem {
  id: string
  inviteType: InviteType
  status: InviteStatus
  maxUses: number
  usedCount: number
  preFilledRole: string
  permissionsTemplate: ExtraPermission[]
  createdBy: string
  expiresAt: string
  createdAt: string
}

// ---- Members ----

export interface ListMembersRequest {
  houseId: string
  role?: UserRole
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface MemberItem {
  id: string
  userId: string
  role: UserRole
  extraPermissions: ExtraPermission[]
  isActive: boolean
  fullName: string
  email: string
  phone: string
  photoUrl: string | null
  joinedAt: string
  createdAt: string
}

export interface GetMemberDetailsRequest {
  houseId: string
  memberId: string
}

export interface MemberDetails {
  id: string
  userId: string
  role: UserRole
  extraPermissions: ExtraPermission[]
  isActive: boolean
  joinedAt: string
  user: {
    fullName: string
    email: string
    phone: string
    alternatePhone: string | null
    documentType: string | null
    documentNumber: string | null
    photoUrl: string | null
  }
  mediumProfile: {
    cpf: string
    rg: string
    bloodType: string | null
    emergencyContactName: string
    emergencyContactPhone: string
    orixa: string | null
    developmentStartDate: string | null
    initiationDate: string | null
  } | null
}

export interface UpdateMemberPermissionsRequest {
  houseId: string
  memberId: string
  extraPermissions: ExtraPermission[]
}

// ---- Dashboard ----

export interface GetDashboardSummaryRequest {
  houseId: string
}

export interface DashboardSummary {
  totalMembers: number
  activeMembers: number
  totalRevenue: number
  pendingFees: number
  activeCampaigns: number
  activeRaffles: number
  lastUpdatedAt: string
}

// ---- Finance: Monthly Fees ----

export interface CreateMonthlyFeeRequest {
  houseId: string
  memberId: string
  referenceMonth: string
  amount: number
  dueDate: string
}

export interface CreateBulkMonthlyFeesRequest {
  houseId: string
  referenceMonth: string
  amount: number
  dueDate: string
}

export interface CreateBulkMonthlyFeesResponse {
  created: number
  skipped: number
  referenceMonth: string
}

export type FeeStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'
export type PaymentMethod = 'pix' | 'cash' | 'card' | 'transfer' | 'other'

export interface ListMonthlyFeesRequest {
  houseId: string
  memberId?: string
  status?: FeeStatus
  referenceMonth?: string
  page?: number
  limit?: number
}

export interface MonthlyFeeItem {
  id: string
  memberId: string
  userId: string
  memberName: string | null
  referenceMonth: string
  amount: number
  status: FeeStatus
  dueDate: string
  paidAt: string | null
  paymentMethod: PaymentMethod | null
  registeredBy: string
  createdAt: string
}

export interface UpdateMonthlyFeeRequest {
  houseId: string
  feeId: string
  amount?: number
  dueDate?: string
  status?: FeeStatus
}

export interface PayMonthlyFeeRequest {
  houseId: string
  feeId: string
  paymentMethod: PaymentMethod
  receiptUrl?: string
}

export interface DeleteMonthlyFeeRequest {
  houseId: string
  feeId: string
}

// ---- Finance: Payments ----

export type PaymentType = 'income' | 'expense'

export interface CreatePaymentRequest {
  houseId: string
  description: string
  amount: number
  type: PaymentType
  category: string
  paymentMethod?: PaymentMethod
  memberId?: string
  receiptUrl?: string
  coraEntryId?: string
  paidAt?: string
}

export interface ListPaymentsRequest {
  houseId: string
  type?: PaymentType
  status?: FeeStatus
  category?: string
  page?: number
  limit?: number
}

export interface PaymentItem {
  id: string
  description: string
  amount: number
  type: PaymentType
  category: string
  status: FeeStatus
  paymentMethod: PaymentMethod | null
  paidAt: string | null
  registeredBy: string
  memberId: string | null
  createdAt: string
}

export interface DeletePaymentRequest {
  houseId: string
  paymentId: string
}

// ---- Finance: Debts ----

export interface CreateDebtRequest {
  houseId: string
  memberId: string
  description: string
  amount: number
  dueDate?: string
}

export interface PayDebtRequest {
  houseId: string
  debtId: string
  amount: number
  paymentMethod: PaymentMethod
}

export interface DeleteDebtRequest {
  houseId: string
  debtId: string
}

export interface PayDebtResponse {
  debtId: string
  amountPaid: number
  remainingAmount: number
  status: 'pending' | 'paid'
}

export interface ListDebtsRequest {
  houseId: string
  memberId?: string
  status?: FeeStatus
  page?: number
  limit?: number
}

export interface DebtItem {
  id: string
  memberId: string
  userId: string
  memberName: string | null
  description: string
  amount: number
  remainingAmount: number
  status: FeeStatus
  dueDate: string | null
  createdAt: string
}

// ---- Finance: Financial Statement ----

export interface ListFinancialStatementRequest {
  houseId: string
  type?: 'income' | 'expense' | 'all'
  source?: 'monthly_fee' | 'payment' | 'store_sale' | 'campaign_quota' | 'external_contribution' | 'raffle' | 'shopping' | 'all'
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface FinancialStatementEntry {
  id: string
  date: string | null
  description: string
  amount: number
  type: 'income' | 'expense'
  status: string
  source: string
  sourceLabel: string
  personName: string
  paymentMethod: string | null
  referenceId: string
}

export interface FinancialStatementResponse {
  data: FinancialStatementEntry[]
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    totalTransactions: number
  }
  pagination: PaginationInfo
}

// ---- Finance: Payment Tags ----

export type PaymentTagType = 'income' | 'expense' | 'both'

export interface PaymentTag {
  id: string
  name: string
  type: PaymentTagType
}

export interface CreatePaymentTagRequest {
  houseId: string
  name: string
  type: PaymentTagType
}

export interface DeletePaymentTagRequest {
  houseId: string
  tagId: string
}

// ---- Finance: Recurring Monthly Fee ----

export interface CreateRecurringMonthlyFeeRequest {
  houseId: string
  memberId: string
  startMonth: string
  amount: number
  dueDay: number
  months: number
}

export interface CreateRecurringMonthlyFeeResponse {
  created: number
  skipped: number
  months: string[]
}

// ---- Finance: My Financial Summary ----

export interface GetMyFinancialSummaryRequest {
  houseId: string
  referenceMonth?: string
}

export interface ShoppingDebtItem {
  id: string
  listId: string
  listTitle: string
  listType: string
  amount: number
  createdAt: string
}

export interface MyFinancialSummary {
  pendingFees: MonthlyFeeItem[]
  currentMonthFee: MonthlyFeeItem | null
  debts: DebtItem[]
  storeTab: SaleItem[]
  quotas: QuotaItem[]
  shoppingDebts: ShoppingDebtItem[]
  recentPayments: PaymentItem[]
  recentPurchases: SaleItem[]
  referenceMonth: string
  totals: {
    pendingFeesCount: number
    pendingFeesTotal: number
    overdueFeesCount: number
    overdueFeesTotal: number
    totalDebt: number
    storeTabTotal: number
    totalQuotasPending: number
    totalShoppingPending: number
    totalOwed: number
    totalFeesPaid: number
    totalDebtsPaid: number
    totalPurchasesPaid: number
    totalQuotasPaid: number
    totalPaid: number
  }
}

// ---- Store: Delete ----

export interface DeleteStoreItemRequest {
  houseId: string
  itemId: string
}

// ---- Calendar ----

export interface CreateEventRequest {
  houseId: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  isRecurring?: boolean
  recurrenceRule?: string
  location?: string
  isPublic?: boolean
}

export interface UpdateEventRequest {
  houseId: string
  eventId: string
  title?: string
  description?: string
  startDate?: string
  endDate?: string
  isRecurring?: boolean
  recurrenceRule?: string
  location?: string
  isActive?: boolean
  isPublic?: boolean
}

export interface ListEventsRequest {
  houseId: string
  startAfter?: string
  startBefore?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export interface EventItem {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  isRecurring: boolean
  recurrenceRule: string | null
  location: string | null
  createdBy: string
  isPublic: boolean
  isActive: boolean
  createdAt: string
}

export interface PublicEventItem {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  isRecurring: boolean
  location: string | null
}

export interface DeleteEventRequest {
  houseId: string
  eventId: string
}

// ---- Public Listings ----

export interface PublicRaffleListItem {
  id: string
  title: string
  slug: string
  description: string | null
  numberPrice: number
  totalNumbers: number
  soldNumbers: number
  status: string
  imageUrl: string | null
  drawDate: string | null
}

export interface PublicCampaignListItem {
  id: string
  title: string
  slug: string
  description: string | null
  goalAmount: number
  currentAmount: number
  status: string
  imageUrl: string | null
  startDate: string | null
  endDate: string | null
}

// ---- Check-ins ----

export type CheckinType = 'gira' | 'evento' | 'desenvolvimento' | 'outro'

export interface RegisterCheckinRequest {
  houseId: string
  memberId: string
  type: CheckinType
  eventId?: string
  notes?: string
}

export interface RegisterBulkCheckinRequest {
  houseId: string
  memberIds: string[]
  type: CheckinType
  eventId?: string
  notes?: string
}

export interface ListCheckinsRequest {
  houseId: string
  memberId?: string
  type?: CheckinType
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface CheckinItem {
  id: string
  memberId: string
  userId: string
  type: CheckinType
  eventId: string | null
  checkinAt: string
  registeredBy: string
  notes: string | null
  createdAt: string
}

export interface GetMemberCheckinSummaryRequest {
  houseId: string
  memberId: string
  startDate?: string
  endDate?: string
}

export interface CheckinSummary {
  memberId: string
  houseId: string
  summary: {
    gira: number
    evento: number
    desenvolvimento: number
    outro: number
    total: number
  }
}

// ---- Campaigns ----

export type CampaignStatus = 'draft' | 'active' | 'completed' | 'cancelled'

export interface CreateCampaignRequest {
  houseId: string
  title: string
  description: string
  goalAmount: number
  isPublic?: boolean
  imageUrl?: string
  startDate: string
  endDate?: string
  assignedMemberIds?: string[]
}

export interface UpdateCampaignRequest {
  houseId: string
  campaignId: string
  title?: string
  description?: string
  goalAmount?: number
  isPublic?: boolean
  imageUrl?: string
  endDate?: string
  status?: CampaignStatus
}

export interface ListCampaignsRequest {
  houseId: string
  status?: CampaignStatus
  page?: number
  limit?: number
}

export interface CampaignItem {
  id: string
  title: string
  slug: string
  description: string
  goalAmount: number
  currentAmount: number
  status: CampaignStatus
  isPublic: boolean
  imageUrl: string | null
  assignedMemberIds: string[]
  startDate: string
  endDate: string | null
  createdAt: string
}

export interface AssignQuotaRequest {
  houseId: string
  campaignId: string
  memberId: string
  amount: number
}

export interface AssignQuotaWithPixRequest extends AssignQuotaRequest {
  buyerDocument: string
}

export interface AssignQuotaWithPixResponse {
  quotaId: string
  amount: number
  status: string
  pix?: { emv: string } | null
  invoiceId?: string
}

export interface QuotaPaymentStatusResponse {
  quotaId: string
  isPaid: boolean
  amount: number
}

export interface PayQuotaRequest {
  houseId: string
  quotaId: string
  amount: number
}

export interface RegisterExternalContributionRequest {
  houseId: string
  campaignId: string
  donorName: string
  donorPhone?: string
  amount: number
  message?: string
}

export interface UpdateContributionStatusRequest {
  houseId: string
  contributionId: string
  isPaid: boolean
}

export interface ListQuotasRequest {
  houseId: string
  campaignId: string
  status?: 'pending' | 'partial' | 'paid'
  page?: number
  limit?: number
}

// ---- Raffles ----

export type RaffleStatus = 'draft' | 'selling' | 'drawn' | 'cancelled'

export interface CreateRaffleRequest {
  houseId: string
  title: string
  description: string
  prizeDescription: string
  numberPrice: number
  totalNumbers: number
  isPublic?: boolean
  imageUrl?: string
  drawDate?: string
}

export interface UpdateRaffleRequest {
  houseId: string
  raffleId: string
  title?: string
  description?: string
  prizeDescription?: string
  isPublic?: boolean
  imageUrl?: string
  drawDate?: string
  status?: RaffleStatus
}

export interface ListRafflesRequest {
  houseId: string
  status?: RaffleStatus
  page?: number
  limit?: number
}

export interface RaffleItem {
  id: string
  title: string
  slug: string
  description: string
  prizeDescription: string
  numberPrice: number
  totalNumbers: number
  soldNumbers: number
  status: RaffleStatus
  isPublic: boolean
  imageUrl: string | null
  drawDate: string | null
  winnerNumber: number | null
  winnerName: string | null
  createdAt: string
}

export interface RaffleDetails extends RaffleItem {
  winnerNumber: number | null
  winnerName: string | null
  numbers: { number: number; buyerName: string; isPaid: boolean }[]
}

export interface ReserveRaffleNumbersRequest {
  houseId: string
  raffleId: string
  numbers: number[]
  buyerName: string
  buyerPhone: string
  memberId?: string
}

export interface ReserveRaffleNumbersResponse {
  reservationId: string
  numbers: number[]
  totalAmount: number
  buyerName: string
  duplicate?: boolean
  existingBuyerName?: string
  existingNumbers?: number[]
  existingAmount?: number
}

export interface PublicReserveRaffleNumbersRequest {
  houseSlug: string
  raffleSlug: string
  numbers: number[]
  buyerName: string
  buyerPhone: string
  forceCreate?: boolean
}

// PIX Raffle
export interface PublicReserveRaffleWithPixRequest {
  houseSlug: string
  raffleSlug: string
  numbers: number[]
  buyerName: string
  buyerPhone: string
  buyerDocument: string
  forceCreate?: boolean
}

export interface PublicReserveRaffleWithPixResponse extends ReserveRaffleNumbersResponse {
  pix?: { emv: string } | null
  bankSlip?: { barcode: string; digitable: string; url: string } | null
  invoiceId?: string
}

export interface PublicReservationStatusResponse {
  reservationId: string
  isPaid: boolean
  totalAmount: number
  buyerName: string
}

export interface PublicRegisterContributionRequest {
  houseSlug: string
  campaignSlug: string
  donorName: string
  donorPhone: string
  amount: number
  message?: string
  forceCreate?: boolean
}

export interface PublicRegisterContributionResponse {
  contributionId: string
  amount: number
  duplicate?: boolean
  existingAmount?: number
  existingDonorName?: string
}

// PIX Contribution
export interface PublicContributeWithPixRequest {
  houseSlug: string
  campaignSlug: string
  donorName: string
  donorPhone: string
  donorDocument: string
  amount: number
  message?: string
  forceCreate?: boolean
}

export interface PublicContributeWithPixResponse {
  contributionId: string
  amount: number
  isPaid: boolean
  duplicate?: boolean
  existingAmount?: number
  existingDonorName?: string
  pix?: {
    emv: string
  } | null
  bankSlip?: {
    barcode: string
    digitable: string
    url: string
  } | null
  invoiceId?: string
}

export interface PublicContributionStatusResponse {
  contributionId: string
  isPaid: boolean
  paidAt: string | null
  amount: number
  donorName: string
}

export interface ListRaffleReservationsRequest {
  houseId: string
  raffleId: string
  isPaid?: boolean
  page?: number
  limit?: number
}

export interface RaffleReservationItem {
  id: string
  buyerName: string
  buyerPhone: string
  numbers: number[]
  totalAmount: number
  isPaid: boolean
  createdAt: string
}

export interface ConfirmRafflePaymentRequest {
  houseId: string
  reservationId: string
}

export interface DrawRaffleRequest {
  houseId: string
  raffleId: string
}

export interface DrawRaffleResponse {
  raffleId: string
  winnerNumber: number
  winnerName: string
  status: 'drawn'
}

export interface DeleteRaffleRequest {
  houseId: string
  raffleId: string
}

export interface DeleteCampaignRequest {
  houseId: string
  campaignId: string
}

// ---- Store ----

export type StoreCategory = 'store' | 'canteen'

export interface CreateStoreItemRequest {
  houseId: string
  name: string
  description?: string
  price: number
  stock?: number
  imageUrl?: string
  category?: StoreCategory
}

export interface UpdateStoreItemRequest {
  houseId: string
  itemId: string
  name?: string
  description?: string
  price?: number
  stock?: number
  imageUrl?: string
  isActive?: boolean
  category?: StoreCategory
}

export interface ListStoreItemsRequest {
  houseId: string
  isActive?: boolean
  category?: StoreCategory
  page?: number
  limit?: number
}

export interface StoreItem {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  imageUrl: string | null
  isActive: boolean
  category: StoreCategory
  createdAt: string
}

export interface RegisterSaleRequest {
  houseId: string
  itemId: string
  quantity: number
  buyerName?: string
  memberId?: string
  paymentMethod?: PaymentMethod
  isPaid?: boolean
}

export interface RegisterSaleResponse {
  saleId: string
  itemName: string
  quantity: number
  totalPrice: number
  isPaid: boolean
  orderNumber?: string
}

export type SaleStatus = 'paid' | 'pending' | 'tab' | 'unpaid' | 'ready'

export interface ListSalesRequest {
  houseId: string
  itemId?: string
  memberId?: string
  isPaid?: boolean
  status?: SaleStatus
  source?: 'internal' | 'public'
  category?: StoreCategory
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface PaySaleRequest {
  houseId: string
  saleId: string
  paymentMethod: PaymentMethod
}

export interface UpdateSaleStatusRequest {
  houseId: string
  saleId: string
  status: SaleStatus  // includes 'ready' for ready-for-pickup
  paymentMethod?: PaymentMethod
  memberId?: string
}

export interface GetSalesSummaryRequest {
  houseId: string
  date: string
  category?: StoreCategory
}

export interface SalesSummary {
  date: string
  totalSales: number
  totalRevenue: number
  totalPaid: number
  totalPending: number
  paidCount: number
  pendingCount: number
}

// ---- Public Store ----

export interface PublicStoreItem {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  imageUrl: string | null
  category: StoreCategory
}

export interface PublicStoreData {
  items: PublicStoreItem[]
  house: {
    id: string
    name: string
    slug: string
    photoUrl: string
  }
}

export interface PublicStoreOrderRequest {
  houseSlug: string
  items: { itemId: string; quantity: number }[]
  buyerName: string
  buyerPhone?: string
  notes?: string
  forceCreate?: boolean
}

export interface PublicStoreOrderResponse {
  sales: {
    saleId: string
    itemName: string
    quantity: number
    totalPrice: number
  }[]
  orderTotal: number
  buyerName: string
  orderNumber: string
  duplicate?: boolean
  existingBuyerName?: string
  existingOrderNumber?: string
  existingTotal?: number
}

export interface PublicStoreMembersData {
  members: {
    memberId: string
    name: string
  }[]
}

// ---- Shopping Lists / Trabalhos / Jogos ----

export type ShoppingListType = 'list' | 'job' | 'game'
export type ShoppingListStatus = 'active' | 'completed' | 'archived'

export interface CreateShoppingListRequest {
  houseId: string
  title: string
  description?: string
  type?: ShoppingListType
  assignedMemberIds?: string[]
  price?: number
}

export interface UpdateShoppingListRequest {
  houseId: string
  listId: string
  title?: string
  description?: string
  price?: number | null
  assignedMemberIds?: string[] | null
}

export interface DeleteShoppingListRequest {
  houseId: string
  listId: string
}

export interface ArchiveShoppingListRequest {
  houseId: string
  listId: string
}

export interface ListShoppingListsRequest {
  houseId: string
  type?: ShoppingListType
  status?: ShoppingListStatus
  isCompleted?: boolean
  page?: number
  limit?: number
}

export interface ListShoppingItemsRequest {
  houseId: string
  listId: string
}

export interface AddShoppingItemRequest {
  houseId: string
  listId: string
  name: string
  quantity?: number
  unit?: string
}

export interface ToggleShoppingItemRequest {
  houseId: string
  itemId: string
  isPurchased: boolean
  price?: number
}

export interface CompleteShoppingListRequest {
  houseId: string
  listId: string
}

export interface SignUpForListRequest {
  houseId: string
  listId: string
}

export interface AdminSignUpMemberRequest {
  houseId: string
  listId: string
  memberId: string
}

export interface ConfirmListPaymentRequest {
  houseId: string
  itemId: string
  isPaid?: boolean
}

// ---- Personal Notes ----

export interface CreateNoteRequest {
  houseId: string
  title: string
  content: string
  isPrivate?: boolean
}

export interface UpdateNoteRequest {
  houseId: string
  noteId: string
  title?: string
  content?: string
  isPrivate?: boolean
}

export interface ListNotesRequest {
  houseId: string
  page?: number
  limit?: number
}

export interface DeleteNoteRequest {
  houseId: string
  noteId: string
}

// ---- Notifications ----

export interface SendNotificationRequest {
  houseId: string
  title: string
  body: string
  targetUserIds?: string[]
  targetRole?: string
  type?: string
  referenceId?: string
  referenceType?: string
}

export interface ListNotificationsRequest {
  houseId: string
  isRead?: boolean
  page?: number
  limit?: number
}

export interface NotificationItem {
  id: string
  title: string
  body: string
  type: string
  referenceId: string | null
  referenceType: string | null
  isRead: boolean
  createdAt: string
}

export interface MarkNotificationReadRequest {
  notificationId: string
}

export interface MarkAllNotificationsReadRequest {
  houseId: string
}

// ---- Public ----

export interface GetPublicHouseRequest {
  houseSlug: string
}

export interface PublicHouse {
  id: string
  name: string
  displayName: string
  slug: string
  address: string
  daysOfGira: string[]
  contactNumbers: string[]
  photoUrl: string | null
  description: string | null
  memberCount: number
  siteConfig?: {
    siteEnabled: boolean
    subdomain: string
    siteTitle: string | null
    template: 'classic' | 'modern' | 'minimal'
    instagramUrl: string | null
    facebookUrl: string | null
    youtubeUrl: string | null
    whatsappNumber: string | null
    heroImageUrl: string | null
    aboutText: string | null
    giraScheduleText: string | null
    primaryColor: string | null
    secondaryColor: string | null
    logoUrl: string | null
    faviconUrl: string | null
  }
}

export interface UpdateHouseSiteConfigRequest {
  houseId: string
  siteConfig: Partial<{
    siteEnabled: boolean
    subdomain: string
    siteTitle: string
    template: 'classic' | 'modern' | 'minimal'
    instagramUrl: string
    facebookUrl: string
    youtubeUrl: string
    whatsappNumber: string
    heroImageUrl: string
    aboutText: string
    giraScheduleText: string
    primaryColor: string
    secondaryColor: string
    logoUrl: string
    faviconUrl: string
  }>
}

export interface CheckSubdomainRequest {
  subdomain: string
}

export interface CheckSubdomainResponse {
  available: boolean
}

export interface GetPublicCampaignRequest {
  houseSlug: string
  campaignSlug: string
}

export interface PublicCampaign {
  id: string
  title: string
  slug: string
  description: string
  goalAmount: number
  currentAmount: number
  status: string
  imageUrl: string | null
  startDate: string
  endDate: string | null
  house: {
    name: string
    slug: string
    photoUrl: string | null
  }
}

export interface GetPublicRaffleRequest {
  houseSlug: string
  raffleSlug: string
}

export interface PublicRaffle {
  id: string
  title: string
  slug: string
  description: string
  prizeDescription: string
  numberPrice: number
  totalNumbers: number
  soldNumbers: number
  status: string
  imageUrl: string | null
  drawDate: string | null
  winnerNumber: number | null
  takenNumbers: { number: number; available: false }[]
  house: {
    name: string
    slug: string
    photoUrl: string | null
  }
}

// ---- Quota ----

export interface QuotaItem {
  id: string
  campaignId: string
  campaignName?: string
  memberId: string
  userId: string
  memberName: string | null
  amount: number
  paidAmount: number
  status: 'pending' | 'partial' | 'paid'
  createdAt: string
}

// ---- Campaign Contributions ----

export interface ListCampaignContributionsRequest {
  houseId: string
  campaignId: string
  type?: 'member' | 'external'
  page?: number
  limit?: number
}

export interface CampaignContributionItem {
  id: string
  type: 'member' | 'external'
  name: string | null
  phone: string | null
  amount: number
  paidAmount: number | null
  status: 'pending' | 'partial' | 'paid' | null
  message: string | null
  createdAt: string
}

// ---- Sale ----

export interface SaleItem {
  id: string
  itemId: string
  itemName: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  buyerName: string | null
  buyerPhone: string | null
  memberId: string | null
  paymentMethod: string | null
  isPaid: boolean
  status: SaleStatus
  paidAt: string | null
  debtId: string | null
  notes: string | null
  registeredBy: string | null
  source: 'internal' | 'public'
  orderNumber: string | null
  createdAt: string
}

// ---- Shopping Lists ----

export interface ShoppingListItem {
  id: string
  title: string
  description: string | null
  type: ShoppingListType
  status: ShoppingListStatus
  assignedMemberIds: string[]
  price: number | null
  isCompleted: boolean
  createdBy: string
  createdAt: string
}

export interface ShoppingItem {
  id: string
  listId: string
  name: string
  quantity: number | null
  unit: string | null
  isPurchased: boolean
  purchasedBy: string | null
  price: number | null
  memberId: string | null
  memberName: string | null
  isPaid: boolean | null
  paidAt: string | null
  createdAt: string
}

// ---- Notes ----

export interface NoteItem {
  id: string
  title: string
  content: string
  isPrivate: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

// ---- FCM ----

export interface RegisterFcmTokenRequest {
  token: string
}

// ---- Pagination ----

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

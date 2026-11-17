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
  /** null para quem não é admin nem tem canManageMembers. */
  email: string | null
  /** Só dígitos (10–11). null para quem não é admin nem tem canManageMembers. */
  phone: string | null
  photoUrl: string | null
  joinedAt: string
  createdAt: string
  /** Titular da casa (houses.ownerId): não pode ser desativada nem sair da Liderança. */
  isOwner?: boolean
  deactivatedAt?: string | null
}

export interface SetMemberActiveRequest {
  houseId: string
  memberId: string
  reason?: string
}

export interface SetMemberActiveResponse {
  memberId: string
  isActive: boolean
  changed: boolean
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
  /** Titular da casa (houses.ownerId). */
  isOwner?: boolean
  joinedAt: string
  user: {
    fullName: string
    email: string | null
    phone: string | null
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

export interface ChangeMemberRoleRequest {
  houseId: string
  memberId: string
  role: UserRole
  /** Só ao virar Membro. Sem ela, volta com as permissões de antes da Liderança. */
  extraPermissions?: ExtraPermission[]
}

export interface ChangeMemberRoleResponse {
  memberId: string
  role: UserRole
  roleLabel: string
  extraPermissions: ExtraPermission[]
  changed: boolean
}

export interface TransferHouseOwnershipRequest {
  houseId: string
  memberId: string
}

export interface TransferHouseOwnershipResponse {
  houseId: string
  memberId: string
  newOwnerName: string | null
  changed: boolean
}

// ---- Dashboard ----

export interface GetDashboardSummaryRequest {
  houseId: string
}

export interface DashboardSummary {
  totalMembers: number
  activeMembers: number
  activeCampaigns: number
  activeRaffles: number
  lastUpdatedAt: string
  /** Receita do ledger (líquida de estornos), por origem. */
  revenue: {
    monthlyFees: number
    storeSales: number
    raffles: number
    campaigns: number
    /** Pagamentos avulsos + pagamentos de dívida + lançamentos manuais. */
    payments: number
    shopping: number
    total: number
  }
  expenses: {
    payments: number
    total: number
  }
  balance: number
  /** Valores em aberto (mesma regra do extrato). Fiado de loja só em sales. */
  pending: {
    feesCount: number
    feesAmount: number
    debtsCount: number
    debtsAmount: number
    salesCount: number
    salesAmount: number
    shoppingCount: number
    shoppingAmount: number
    quotasCount: number
    quotasAmount: number
    /** Reservas de rifa não pagas (rifa à venda). */
    rafflesCount?: number
    rafflesAmount?: number
    /** Mensalidades de competências futuras (fora do total). */
    upcomingFeesCount: number
    upcomingFeesAmount: number
    totalAmount: number
  }
}

export interface RecalculateHouseSummaryResponse {
  totalRevenue: number
  totalExpense: number
  balance: number
  pendingFees: number
  breakdown: Record<string, { revenue: number; expense: number; net: number }>
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

export interface DeleteBulkMonthlyFeesRequest {
  houseId: string
  feeIds?: string[]
  memberId?: string
  referenceMonth?: string
  status?: FeeStatus
}

export interface DeleteBulkMonthlyFeesResponse {
  deleted: number
  feeIds: string[]
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
  /** Data real do recebimento ("YYYY-MM-DD", dia civil BRT). Não pode ser futura. Padrão: agora. */
  paidAt?: string
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
  /** Data real do recebimento ("YYYY-MM-DD", dia civil BRT). Não pode ser futura. Padrão: agora. */
  paidAt?: string
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

export interface UpdateDebtRequest {
  houseId: string
  debtId: string
  description?: string
  /** '' remove o vencimento (o back troca null por undefined). */
  dueDate?: string
  /** Só aceito enquanto a dívida não tem pagamento. */
  amount?: number
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

export interface MyRecentFeePayment {
  id: string
  referenceMonth: string
  amount: number
  paidAt: string | null
  paymentMethod: PaymentMethod | null
}

/** Reserva de rifa não paga: "Rifa X — 3 números (12, 15, 40)". */
export interface OwedRaffleReservation {
  id: string
  raffleId: string
  raffleTitle: string
  numbers: number[]
  numberPrice: number
  amount: number
  description: string
  expiresAt: string | null
  createdAt: string | null
}

/** Pedido da loja não pago fora do fiado. */
export interface OwedStoreOrder {
  id: string
  itemName: string
  quantity: number
  totalPrice: number
  orderNumber: string | null
  createdAt: string | null
}

/** Cobrança de outro filho contra o membro (não é dívida com a casa). */
export interface OwedMemberCharge {
  id: string
  creatorName: string
  description: string
  amount: number
  status: 'pending' | 'accepted'
  createdAt: string | null
}

export interface MyFinancialSummary {
  pendingFees: MonthlyFeeItem[]
  currentMonthFee: MonthlyFeeItem | null
  debts: DebtItem[]
  storeTab: SaleItem[]
  quotas: QuotaItem[]
  shoppingDebts: ShoppingDebtItem[]
  storeOrders?: OwedStoreOrder[]
  raffleReservations?: OwedRaffleReservation[]
  memberCharges?: OwedMemberCharge[]
  /** Últimas mensalidades pagas pelo membro. */
  recentPayments: MyRecentFeePayment[]
  recentPurchases: SaleItem[]
  referenceMonth: string
  totals: {
    pendingFeesCount: number
    pendingFeesTotal: number
    overdueFeesCount: number
    overdueFeesTotal: number
    totalDebt: number
    storeTabTotal: number
    totalStoreOrdersPending?: number
    totalRafflesPending?: number
    totalQuotasPending: number
    totalShoppingPending: number
    totalOwed: number
    /** Cobranças validadas de outros filhos (fora do totalOwed). */
    totalMemberChargesOwed?: number
    totalFeesPaid: number
    totalDebtsPaid: number
    totalPurchasesPaid: number
    totalQuotasPaid: number
    totalPaid: number
  }
}

// ---- Delete: Sale ----

export interface DeleteSaleRequest {
  houseId: string
  saleId: string
}

// ---- Delete: Shopping Item ----

export interface DeleteShoppingItemRequest {
  houseId: string
  itemId: string
}

// ---- Delete: Raffle Reservation ----

export interface DeleteRaffleReservationRequest {
  houseId: string
  reservationId: string
}

// ---- Delete: Contribution ----

export interface DeleteContributionRequest {
  houseId: string
  contributionId: string
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
  /** Confirmados (contador denormalizado no evento). */
  attendeesCount?: number
  /** O usuário logado confirmou presença. */
  isAttending?: boolean
}

export interface RsvpEventRequest {
  houseId: string
  eventId: string
}

export interface RsvpEventResponse {
  eventId: string
  confirmed: boolean
  attendeesCount: number
}

export interface ListEventAttendeesRequest {
  houseId: string
  eventId: string
  page?: number
  limit?: number
}

export interface EventAttendee {
  userId: string
  memberId: string
  fullName: string | null
  confirmedAt: string | null
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

export interface RegisterCheckinResponse {
  checkinId: string
  memberId: string
  type: CheckinType
  /** fix/campaigns: true quando o membro já tinha check-in (nada novo gravado). */
  alreadyRegistered?: boolean
}

export interface RegisterBulkCheckinResponse {
  /** fix/campaigns: contagens do lote. Back antigo devolve `count`. */
  registered?: number
  alreadyRegistered?: number
  ignored?: number
  count?: number
  type?: CheckinType
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

export interface PayQuotaRequest {
  houseId: string
  quotaId: string
  amount: number
  paymentMethod?: PaymentMethod
  /** "YYYY-MM-DD" (dia civil BRT), não pode ser futura. */
  paidAt?: string
}

export interface PayQuotaResponse {
  quotaId: string
  paidAmount: number
  status: 'pending' | 'partial' | 'paid'
  paymentId?: string
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
  /** "drawn" só via drawRaffle; drawn/cancelled são finais; selling→draft só sem vendas. */
  status?: Exclude<RaffleStatus, 'drawn'>
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
  /** Reservados + pagos (ocupados). */
  soldNumbers: number
  /** Números já pagos (back novo; ausente em resposta antiga). */
  paidNumbers?: number
  /** Reservados aguardando pagamento. */
  reservedNumbers?: number
  status: RaffleStatus
  isPublic: boolean
  imageUrl: string | null
  drawDate: string | null
  winnerNumber: number | null
  winnerName: string | null
  createdAt: string
}

export interface RaffleDrawAudit {
  algorithm?: string
  seed: string
  eligibleCount: number
  eligibleHash: string
  winnerIndex: number
}

export interface RaffleDetails extends RaffleItem {
  winnerNumber: number | null
  winnerName: string | null
  numbers: { number: number; buyerName: string; isPaid: boolean; reservationId?: string | null }[]
  /** fix/campaigns: dados de auditoria do sorteio. */
  draw?: RaffleDrawAudit | null
  drawnAt?: string | null
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
  /** null quando é duplicata (fix/campaigns). */
  reservationId: string | null
  /** fix/campaigns: quando a reserva pendente expira. */
  expiresAt?: string | null
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
}

export interface PublicRegisterContributionRequest {
  houseSlug: string
  campaignSlug: string
  donorName: string
  donorPhone: string
  amount: number
  message?: string
}

export interface PublicRegisterContributionResponse {
  /** null quando é duplicata (fix/campaigns). */
  contributionId: string | null
  amount: number
  duplicate?: boolean
  existingAmount?: number
  existingDonorName?: string
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
  buyerPhone: string | null
  numbers: number[]
  totalAmount: number
  isPaid: boolean
  /** fix/campaigns */
  source?: 'internal' | 'public' | null
  expiresAt?: string | null
  createdAt: string
}

export interface ConfirmRafflePaymentRequest {
  houseId: string
  reservationId: string
  paymentMethod?: PaymentMethod
  /** "YYYY-MM-DD" (dia civil BRT), não pode ser futura. */
  paidAt?: string
}

export interface DeleteRaffleReservationResponse {
  reservationId: string
  deleted: boolean
  /** fix/campaigns: valor estornado do caixa (reserva paga), ou null. */
  reversed?: number | null
}

export interface DrawRaffleRequest {
  houseId: string
  raffleId: string
}

export interface DrawRaffleResponse {
  raffleId: string
  winnerNumber: number
  winnerName: string | null
  status: 'drawn'
  /** fix/campaigns */
  draw?: RaffleDrawAudit
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

export interface AdjustStoreItemStockRequest {
  houseId: string
  itemId: string
  /** Variação: positiva = entrada, negativa = saída/perda. */
  delta: number
  reason?: string
}

export interface AdjustStoreItemStockResponse {
  itemId: string
  stock: number
  previousStock: number
}

export interface MarkOrderReadyRequest {
  houseId: string
  saleId: string
  isReady: boolean
}

export interface RegisterSaleResponse {
  debtId?: string | null
  saleId: string
  itemName: string
  quantity: number
  totalPrice: number
  isPaid: boolean
  orderNumber?: string
}

export interface RegisterSaleBatchRequest {
  houseId: string
  items: Array<{ itemId: string; quantity: number }>
  buyerName?: string
  memberId?: string
  paymentMethod?: PaymentMethod
  isPaid?: boolean
}

export interface RegisterSaleBatchResponse {
  /** Linhas do mesmo item são somadas: `sales` pode ter menos linhas que o pedido. */
  debtId?: string | null
  orderNumber: string
  orderTotal: number
  isPaid: boolean
  status: string
  sales: Array<{
    saleId: string
    itemName: string
    quantity: number
    totalPrice: number
  }>
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
  /** 'ready' só por compatibilidade; use markOrderReady. */
  status: SaleStatus
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
  /** Obrigatório: 10–11 dígitos (aceita máscara). */
  buyerPhone: string
  notes?: string
}

/** Duplicata devolve só `{ duplicate: true }` (sem os demais campos). */
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
  targetRole?: UserRole
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
  /** fix/campaigns: horas até a reserva pública pendente expirar. */
  reservationTtlHours?: number
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
  /** Venda quitada por um pagamento de dívida no Financeiro: não muda status nem exclui. */
  paidViaDebtPaymentId?: string | null
  /** Pedido pronto para retirada (markOrderReady). */
  isReady?: boolean
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
  /** Lista "list": só criador, caixa ou admin edita/arquiva/conclui/exclui/confirma. */
  canManage?: boolean
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

// ---- Avisos (mural) ----

export interface NoticeItem {
  id: string
  title: string
  body: string
  pinned: boolean
  expiresAt: string | null
  createdBy: string
  createdByMemberId?: string
  createdAt: string | null
  updatedAt?: string | null
}

export interface CreateNoticeRequest {
  houseId: string
  title: string
  body: string
  pinned?: boolean
  /** Data pura (YYYY-MM-DD) = vale até o fim do dia em Brasília. */
  expiresAt?: string
}

export interface UpdateNoticeRequest {
  houseId: string
  noticeId: string
  title?: string
  body?: string
  pinned?: boolean
  /** '' remove a validade (o back troca null por undefined). */
  expiresAt?: string
}

export interface ListNoticesRequest {
  houseId: string
  includeExpired?: boolean
  page?: number
  limit?: number
}

export interface DeleteNoticeRequest {
  houseId: string
  noticeId: string
}

export type CommunityFeedType = 'event' | 'campaign' | 'fundraising' | 'notice'

export interface CommunityFeedItem {
  id: string
  type: CommunityFeedType
  title: string
  description: string
  createdAt: string
  date: string | null
  location: string | null
  goalAmount: number | null
  raisedAmount: number | null
  attendees: number | null
  imageUrl: string | null
  pinned: boolean
  tags: string[]
  metadata: Record<string, unknown>
}

export interface GetCommunityFeedRequest {
  houseId: string
  filter?: 'all' | CommunityFeedType
  limit?: number
}

export interface CommunityFeed {
  items: CommunityFeedItem[]
  total: number
}

// ---- Me (visão pessoal) ----

export interface MyMonthlyFee {
  id: string
  amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  referenceMonth: string
  dueDate: string | null
  /** Dias civis em BRT: 0 = vence hoje, negativo = atrasada. */
  daysUntilDue: number | null
  paidAt: string | null
  paymentMethod: string | null
}

export interface MyDashboard {
  monthlyFee: MyMonthlyFee | null
  totalContributedYear: number
  totalContributedMonth: number
  donationsCount: number
  donationsAmount: number
  upcomingEventsCount: number
}

// ---- Cobranças entre membros ----

export type MemberChargeStatus = 'pending' | 'accepted' | 'rejected' | 'paid' | 'cancelled'
export type MemberChargeCategory = 'loan' | 'purchase' | 'service' | 'shared_expense' | 'other'
export type MemberChargePaymentMethod = 'pix' | 'cash' | 'card' | 'transfer' | 'internal' | 'other'

export interface MemberCharge {
  id: string
  houseId: string
  creatorMemberId: string
  creatorUserId: string
  creatorName: string
  targetType: 'member' | 'house'
  targetMemberId: string | null
  targetUserId: string | null
  targetName: string | null
  description: string
  amount: number
  category: MemberChargeCategory
  status: MemberChargeStatus
  acceptedAt: string | null
  rejectedAt: string | null
  rejectionReason: string | null
  paidAt: string | null
  paymentMethod: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateMemberChargeRequest {
  houseId: string
  targetType: 'member' | 'house'
  targetMemberIds?: string[]
  description: string
  amount: number
  category?: MemberChargeCategory
}

export interface ListMemberChargesRequest {
  houseId: string
  filter?: 'all' | 'created' | 'received' | 'house'
  status?: 'all' | MemberChargeStatus
  page?: number
  limit?: number
}

export interface MemberChargeActionRequest {
  houseId: string
  chargeId: string
}

export interface RejectMemberChargeRequest extends MemberChargeActionRequest {
  reason?: string
}

export interface PayMemberChargeRequest extends MemberChargeActionRequest {
  paymentMethod: MemberChargePaymentMethod
}

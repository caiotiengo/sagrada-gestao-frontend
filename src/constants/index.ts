// ========================================
// Sagrada Gestão — Constants
// ========================================

export const APP_NAME = 'Sagrada Gestão'
export const APP_TITLE = 'Sagrada Gestão - Organizando o seu Templo'
export const APP_DESCRIPTION = 'Sistema de gestão para casas de santo'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/esqueci-senha',
  REGISTER_ADMIN: '/cadastro',

  // Admin Dashboard
  ADMIN_HOME: '/admin',
  MEMBERS_LIST: '/admin/membros',
  MEMBER_DETAIL: (id: string) => `/admin/membros/${id}`,
  INVITES: '/admin/convites',
  ADMIN_FINANCE: '/admin/financeiro',
  ADMIN_CALENDAR: '/admin/calendario',
  ADMIN_CHECKINS: '/admin/checkins',
  ADMIN_CAMPAIGNS: '/admin/listas',
  ADMIN_CAMPAIGN_DETAIL: (id: string) => `/admin/listas/${id}`,
  ADMIN_RAFFLES: '/admin/rifas',
  ADMIN_RAFFLE_DETAIL: (id: string) => `/admin/rifas/${id}`,
  ADMIN_STORE: '/admin/loja',
  ADMIN_CANTEEN: '/admin/cantina',
  ADMIN_SITE: '/admin/site',

  // Member Dashboard
  MEMBER_HOME: '/membro',
  MEMBER_FINANCE: '/membro/financeiro',
  MEMBER_CALENDAR: '/membro/calendario',
  MEMBER_CAMPAIGNS: '/membro/listas',
  MEMBER_RAFFLES: '/membro/rifas',
  MEMBER_RAFFLE_DETAIL: (id: string) => `/membro/rifas/${id}`,
  MEMBER_SHOPPING: '/membro/compras',
  MEMBER_LOJA: '/membro/loja',
  MEMBER_STORE: '/membro/cantina',
  MEMBER_NOTES: '/membro/notas',

  // Public house pages
  PUBLIC_HOUSE: (slug: string) => `/c/${slug}`,
  MEMBER_REGISTER: (slug: string) => `/c/${slug}/cadastro`,
  ADMIN_INVITE: (slug: string) => `/c/${slug}/admin/convite`,
  PUBLIC_CAMPAIGN: (slug: string, campaignSlug: string) => `/c/${slug}/listas/${campaignSlug}`,
  PUBLIC_RAFFLE: (slug: string, raffleSlug: string) => `/c/${slug}/rifas/${raffleSlug}`,
  PUBLIC_STORE: (slug: string) => `/c/${slug}/loja`,
  PUBLIC_CANTEEN: (slug: string) => `/c/${slug}/cantina`,
} as const

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

export const DAYS_OF_WEEK = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
] as const

export const DOCUMENT_TYPES = [
  { value: 'CPF', label: 'CPF' },
  { value: 'CNPJ', label: 'CNPJ' },
] as const

export const INVITE_STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  used: 'Usado',
  expired: 'Expirado',
  revoked: 'Revogado',
}

export const INVITE_TYPE_LABELS: Record<string, string> = {
  member: 'Filho de Santo',
  admin: 'Administrador',
}

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  filho_de_santo: 'Filho de Santo',
}

export const PERMISSION_LABELS: Record<string, string> = {
  canManageCashier: 'Gerenciar Caixa',
  canRegisterSales: 'Gerenciar Vendas',
  canRegisterInternalPayments: 'Gerenciar Pagamentos',
  canManageMembers: 'Gerenciar Membros',
  canManageCalendar: 'Gerenciar Calendário',
  canManageCampaigns: 'Gerenciar Listas',
  canManageRaffles: 'Gerenciar Rifas',
  canManageJobs: 'Gerenciar Trabalhos',
  canManageGames: 'Gerenciar Jogos',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: 'PIX',
  cash: 'Dinheiro',
  card: 'Cartão',
  transfer: 'Transferência',
  other: 'Outro',
}

export const SALE_STATUS_LABELS: Record<string, string> = {
  paid: 'Pago',
  pending: 'Pendente',
  ready: 'Pronto',
  tab: 'Na conta',
  unpaid: 'Não pago',
}

export const SALE_STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  paid: 'default',
  pending: 'outline',
  ready: 'secondary',
  tab: 'secondary',
  unpaid: 'destructive',
}

export const SHOPPING_LIST_TYPE_LABELS: Record<string, string> = {
  list: 'Lista',
  job: 'Trabalho',
  game: 'Jogo',
}

export const FEE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Atrasado',
  cancelled: 'Cancelado',
}

export const CHECKIN_TYPE_LABELS: Record<string, string> = {
  gira: 'Sessão',
  evento: 'Evento',
  desenvolvimento: 'Desenvolvimento',
  outro: 'Outro',
}

export const USER_STORAGE_KEY = 'sagrada_user'

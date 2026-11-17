// ========================================
// Papéis e permissões — o que a pessoa lê
// ========================================
// Fonte única dos nomes no site. As chaves (admin, filho_de_santo, canManage…)
// são internas e ficam gravadas no banco: não mudam. Mesmos textos do app
// (src/constants/roles.ts) e das mensagens do backend (functions/src/constants/roles.ts).

import type { ExtraPermission, UserRole } from '@/types'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Liderança',
  filho_de_santo: 'Membro',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Vê e cuida de tudo na casa, inclusive o dinheiro. Não paga mensalidade.',
  filho_de_santo:
    'Filho(a) de santo, médium, cambone, ogã, ekedi… Vê o que deve, a agenda e participa.',
}

/** Convite gera o papel com o mesmo nome. */
export const INVITE_TYPE_LABELS: Record<string, string> = {
  member: ROLE_LABELS.filho_de_santo,
  admin: ROLE_LABELS.admin,
}

/** Quem tem a casa no nome (houses.ownerId). Pode passar a titularidade. */
export const OWNER_LABEL = 'Titular'

export interface PermissionInfo {
  key: ExtraPermission
  /** Frase curta do que a pessoa faz. */
  label: string
  /** Uma linha explicando o que libera (conferido no backend). */
  description: string
}

export const PERMISSIONS: PermissionInfo[] = [
  {
    key: 'canManageCashier',
    label: 'Cuida das mensalidades e do caixa',
    description: 'Dá baixa em mensalidades, cobra dívidas e vê o extrato e o painel financeiro da casa.',
  },
  {
    key: 'canRegisterInternalPayments',
    label: 'Lança entradas e saídas do caixa',
    description: 'Registra dinheiro que entrou ou saiu do caixa, como doações, compras e despesas.',
  },
  {
    key: 'canRegisterSales',
    label: 'Vende na cantina e na loja',
    description: 'Registra vendas, cuida dos produtos e do estoque e lança entradas no caixa.',
  },
  {
    key: 'canManageMembers',
    label: 'Cuida dos membros e dos avisos',
    description: 'Vê os dados e contatos dos membros e publica avisos no mural. Convites são só da Liderança.',
  },
  {
    key: 'canManageCalendar',
    label: 'Cuida da agenda',
    description: 'Cria, muda e apaga giras, festas e outros eventos da casa.',
  },
  {
    key: 'canManageCampaigns',
    label: 'Cuida das campanhas',
    description: 'Cria campanhas de arrecadação, divide as cotas e registra quem pagou.',
  },
  {
    key: 'canManageRaffles',
    label: 'Cuida das rifas',
    description: 'Cria rifas, confirma quem pagou os números e faz o sorteio.',
  },
  {
    key: 'canManageJobs',
    label: 'Cuida dos trabalhos',
    description: 'Cria trabalhos com inscrição e valor, escolhe quem participa e confirma os pagamentos.',
  },
  {
    key: 'canManageGames',
    label: 'Cuida dos jogos',
    description: 'Cria jogos e atividades abertos a toda a casa, com inscrição e valor, e confirma os pagamentos.',
  },
]

export const PERMISSION_LABELS = Object.fromEntries(
  PERMISSIONS.map((p) => [p.key, p.label]),
) as Record<ExtraPermission, string>

export interface PermissionPreset {
  id: string
  label: string
  permissions: ExtraPermission[]
}

/** Atalhos: marcar um só marca as caixas; a pessoa ajusta depois. */
export const PERMISSION_PRESETS: PermissionPreset[] = [
  { id: 'tesouraria', label: 'Tesouraria', permissions: ['canManageCashier', 'canRegisterInternalPayments'] },
  { id: 'cantina', label: 'Cantina', permissions: ['canRegisterSales'] },
  { id: 'secretaria', label: 'Secretaria', permissions: ['canManageMembers', 'canManageCalendar'] },
  {
    id: 'eventos',
    label: 'Eventos e arrecadação',
    permissions: ['canManageCampaigns', 'canManageRaffles', 'canManageJobs', 'canManageGames'],
  },
]

/** Une as permissões do atalho às já marcadas (sem repetir, na ordem da lista). */
export function applyPreset(current: ExtraPermission[], preset: PermissionPreset): ExtraPermission[] {
  const set = new Set([...current, ...preset.permissions])
  return PERMISSIONS.map((p) => p.key).filter((k) => set.has(k))
}

export function presetIsOn(current: ExtraPermission[], preset: PermissionPreset): boolean {
  return preset.permissions.every((p) => current.includes(p))
}

/** Aviso mostrado antes de pôr alguém na Liderança. */
export const LEADERSHIP_WARNING = 'Liderança vê e mexe em tudo, inclusive no dinheiro.'

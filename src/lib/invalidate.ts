import type { QueryClient } from '@tanstack/react-query'

/**
 * Chaves de query que dependem do caixa/ledger da casa. Qualquer mutation que
 * mexe em dinheiro (mensalidade, pagamento, dívida, venda, rifa, cota, lista,
 * cobrança, estorno) invalida todas: dashboard, extrato, resumos e listas.
 */
const FINANCE_ROOT_KEYS = new Set<string>([
  'dashboard',
  'dashboard-summary',
  'financial-statement',
  'legacy-financial-statement',
  'my-financial-summary',
  'legacy-my-financial-summary',
  'member-financial-summary',
  'legacy-member-financial-summary',
  'monthly-fees',
  'payments',
  'debts',
  'ledger',
  'validate-ledger',
  'member-charges',
])

export function invalidateFinance(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    predicate: (query) => FINANCE_ROOT_KEYS.has(String(query.queryKey[0])),
  })
}

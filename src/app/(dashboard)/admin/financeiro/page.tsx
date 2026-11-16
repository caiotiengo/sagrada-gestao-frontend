'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Receipt,
  AlertTriangle,
  Plus,
  Check,
  CreditCard,
  Search,
  Pencil,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Trash2,
  Download,
  Settings,
  X,
  UserPlus,
  Repeat,
  RefreshCw,
  ShieldCheck,
  FileSearch,
  Database,
} from 'lucide-react'
import { ROUTES } from '@/constants'
import {
  useMonthlyFees,
  useCreateBulkMonthlyFees,
  useUpdateMonthlyFee,
  usePayMonthlyFee,
  useDeleteMonthlyFee,
  useDeleteBulkMonthlyFees,
  useUpdateDebt,
  usePayments,
  useCreatePayment,
  useDeletePayment,
  useDebts,
  useCreateDebt,
  usePayDebt,
  useDeleteDebt,
  usePaymentTags,
  useCreatePaymentTag,
  useDeletePaymentTag,
  useCreateRecurringMonthlyFee,
} from '@/hooks/use-finance'
import { useAllMembers } from '@/hooks/use-members'
import { useAuthStore } from '@/stores/auth'
import {
  FEE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from '@/constants'
import type {
  MonthlyFeeItem,
  PaymentItem,
  DebtItem,
  FeeStatus,
  PaymentMethod,
  PaymentType,
  PaymentTagType,
} from '@/types'
import { formatCurrency, formatDate } from '@/utils'
import {
  MONTH_NAMES,
  civilDateOf,
  dateSortKey,
  currentYearMonthBRT,
  formatCompetence,
  monthCivilRange,
  todayBRT,
} from '@/utils/dates'
import { downloadCSV } from '@/utils/export-csv'
import { getErrorMessage } from '@/lib/errors'
import { fetchStatementEntries, statementCsvRows, STATEMENT_CSV_HEADERS } from '@/lib/finance-export'
import { useRecalculateHouseSummary } from '@/hooks/use-dashboard'
import { toast } from 'sonner'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { CurrencyInput } from '@/components/forms/currency-input'
import { DateInput } from '@/components/forms/date-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type Tab = 'mensalidades' | 'pagamentos' | 'dividas'

const TAB_OPTIONS: { value: Tab; label: string }[] = [
  { value: 'mensalidades', label: 'Mensalidades' },
  { value: 'pagamentos', label: 'Pagamentos' },
  { value: 'dividas', label: 'Dívidas' },
]

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  income: 'Receita',
  expense: 'Despesa',
}

function feeStatusVariant(status: FeeStatus) {
  switch (status) {
    case 'paid':
      return 'default' as const
    case 'pending':
      return 'secondary' as const
    case 'overdue':
      return 'destructive' as const
    case 'cancelled':
      return 'outline' as const
    default:
      return 'secondary' as const
  }
}

/** Categorias de sistema gravadas pelo back (ex.: pagamento de dívida). */
const SYSTEM_CATEGORY_LABELS: Record<string, string> = {
  debt_payment: 'Pagamento de dívida',
}

function categoryLabel(category: string) {
  return SYSTEM_CATEGORY_LABELS[category] ?? category
}

function isValidDueDay(day: number) {
  return Number.isInteger(day) && day >= 1 && day <= 31
}

function formatYearMonth(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

// ---- Pagination Component ----

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground">
        {page} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Próximo
      </Button>
    </div>
  )
}

// ---- Month Navigator ----

function MonthNavigator({
  year,
  month,
  onPrev,
  onNext,
  onToday,
}: {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}) {
  const now = currentYearMonthBRT()
  const isCurrentMonth = year === now.year && month === now.month

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-2">
      <Button variant="ghost" size="icon" onClick={onPrev}>
        <ChevronLeft className="size-5" />
      </Button>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">
          {MONTH_NAMES[month]} {year}
        </span>
        {!isCurrentMonth && (
          <Button variant="outline" size="sm" onClick={onToday}>
            Hoje
          </Button>
        )}
      </div>
      <Button variant="ghost" size="icon" onClick={onNext}>
        <ChevronRight className="size-5" />
      </Button>
    </div>
  )
}

// ---- Mensalidades Tab ----

function MensalidadesTab() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const canManage = useAuthStore((s) => s.hasPermission('canManageCashier'))
  const now = currentYearMonthBRT()
  const [page, setPage] = useState(1)
  const [year, setYear] = useState(now.year)
  const [month, setMonth] = useState(now.month)
  const [search, setSearch] = useState('')
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [singleDialogOpen, setSingleDialogOpen] = useState(false)
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deleteFeeId, setDeleteFeeId] = useState<string | null>(null)
  const [selectedFee, setSelectedFee] = useState<MonthlyFeeItem | null>(null)
  // Exclusão em lote: ids marcados na página atual (zera ao trocar mês/página).
  const [bulkIds, setBulkIds] = useState<string[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkConfirmText, setBulkConfirmText] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [feePaidAt, setFeePaidAt] = useState('')

  // Edit form state
  const [editAmount, setEditAmount] = useState(0)
  const [editDueDate, setEditDueDate] = useState('')

  // Bulk form state
  const [bulkMonth, setBulkMonth] = useState<number | ''>('')
  const [bulkYear, setBulkYear] = useState<number | ''>('')
  const [bulkAmount, setBulkAmount] = useState(0)
  const [bulkDueDate, setBulkDueDate] = useState('')

  // Single/Recurring form state
  const [singleMemberId, setSingleMemberId] = useState('')
  const [singleMonth, setSingleMonth] = useState<number | ''>('')
  const [singleYear, setSingleYear] = useState<number | ''>('')
  const [singleAmount, setSingleAmount] = useState(0)
  const [singleDueDay, setSingleDueDay] = useState(10)
  const [singleRecurring, setSingleRecurring] = useState(false)
  const [singleMonths, setSingleMonths] = useState(1)

  const referenceMonth = formatYearMonth(year, month)
  const { data, isLoading, isError, refetch } = useMonthlyFees(page, undefined, undefined, referenceMonth)
  const createBulk = useCreateBulkMonthlyFees()
  const createRecurring = useCreateRecurringMonthlyFee()
  const payFee = usePayMonthlyFee()
  const updateFee = useUpdateMonthlyFee()
  const deleteFee = useDeleteMonthlyFee()
  const deleteBulk = useDeleteBulkMonthlyFees()
  const { data: allMembersData } = useAllMembers()
  const allMembers = allMembersData?.data ?? []

  const fees = data?.data ?? []
  const totalPages = data?.pagination?.totalPages ?? 1

  const filteredFees = useMemo(() => {
    if (!search.trim()) return fees
    const term = search.toLowerCase()
    return fees.filter((fee) =>
      fee.memberName?.toLowerCase().includes(term),
    )
  }, [fees, search])

  const bulkSelectedFees = fees.filter((f) => bulkIds.includes(f.id))
  const bulkPaidCount = bulkSelectedFees.filter((f) => f.status === 'paid').length
  const bulkNeedsTyping = bulkSelectedFees.length >= 5 || bulkPaidCount > 0
  const allPageSelected = filteredFees.length > 0 && filteredFees.every((f) => bulkIds.includes(f.id))
  const toggleBulk = (id: string) =>
    setBulkIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const toggleBulkPage = () =>
    setBulkIds(allPageSelected ? [] : filteredFees.map((f) => f.id))
  const handleBulkDelete = () => {
    if (!houseId || bulkSelectedFees.length === 0) return
    deleteBulk.mutate(
      { houseId, feeIds: bulkSelectedFees.map((f) => f.id) },
      {
        onSuccess: () => {
          setBulkIds([])
          setBulkDeleteOpen(false)
          setBulkConfirmText('')
        },
      },
    )
  }
  // Seleção vale só para a página/mês visível.
  const resetBulk = () => setBulkIds([])

  const goToPrevMonth = () => {
    resetBulk()
    setPage(1)
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const goToNextMonth = () => {
    resetBulk()
    setPage(1)
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }
  const goToToday = () => {
    resetBulk()
    setPage(1)
    setYear(now.year)
    setMonth(now.month)
  }

  // Year options for month/year selects (previous, current, next 2)
  const currentYear = now.year
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2]

  /**
   * Combine month index (0-11) and year into ISO "YYYY-MM".
   */
  const monthIso = (m: number | '', y: number | ''): string => {
    if (m === '' || y === '') return ''
    return `${y}-${String(m + 1).padStart(2, '0')}`
  }

  const handleCreateBulk = () => {
    const referenceMonthIso = monthIso(bulkMonth, bulkYear)
    if (!houseId || !referenceMonthIso || !bulkAmount || !bulkDueDate) return
    createBulk.mutate(
      {
        houseId,
        referenceMonth: referenceMonthIso,
        amount: bulkAmount,
        dueDate: bulkDueDate,
      },
      {
        onSettled: (_, error) => {
          if (!error) {
            setBulkDialogOpen(false)
            setBulkMonth('')
            setBulkYear('')
            setBulkAmount(0)
            setBulkDueDate('')
          }
        },
      },
    )
  }

  const handlePayFee = () => {
    if (!houseId || !selectedFee) return
    payFee.mutate(
      {
        houseId,
        feeId: selectedFee.id,
        paymentMethod,
        paidAt: feePaidAt || undefined,
      },
      {
        onSettled: (_, error) => {
          if (!error) {
            setPayDialogOpen(false)
            setSelectedFee(null)
            setPaymentMethod('pix')
          }
        },
      },
    )
  }

  const openPayDialog = (fee: MonthlyFeeItem) => {
    setSelectedFee(fee)
    setPaymentMethod('pix')
    setFeePaidAt(todayBRT())
    setPayDialogOpen(true)
  }

  const openEditDialog = (fee: MonthlyFeeItem) => {
    setSelectedFee(fee)
    setEditAmount(fee.amount)
    setEditDueDate(civilDateOf(fee.dueDate))
    setEditDialogOpen(true)
  }

  const handleEditFee = () => {
    if (!houseId || !selectedFee || !editAmount) return
    updateFee.mutate(
      {
        houseId,
        feeId: selectedFee.id,
        amount: editAmount,
        dueDate: editDueDate || undefined,
      },
      {
        onSettled: (_, error) => {
          if (!error) {
            setEditDialogOpen(false)
            setSelectedFee(null)
            setEditAmount(0)
            setEditDueDate('')
          }
        },
      },
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar mensalidades"
        message="Não foi possível carregar a lista de mensalidades."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Gerencie as mensalidades dos membros
        </p>
        <div className="flex gap-2">
        {canManage && <Dialog open={singleDialogOpen} onOpenChange={(open) => { setSingleDialogOpen(open); if (!open) { setSingleMemberId(''); setSingleMonth(''); setSingleYear(''); setSingleAmount(0); setSingleDueDay(10); setSingleRecurring(false); setSingleMonths(1) } }}>
          <DialogTrigger
            render={
              <Button size="sm" variant="outline" className="gap-1.5">
                <UserPlus className="size-4" />
                <span className="hidden sm:inline">Individual</span>
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Mensalidade Individual</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Membro</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={singleMemberId}
                  onChange={(e) => setSingleMemberId(e.target.value)}
                >
                  <option value="">Selecione um membro</option>
                  {allMembers.filter((m) => m.role !== 'admin').map((m) => (
                    <option key={m.id} value={m.id}>{m.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Mês de referência</Label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={singleMonth === '' ? '' : String(singleMonth)}
                    onChange={(e) => setSingleMonth(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <option value="">Mês</option>
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={idx} value={idx}>{name}</option>
                    ))}
                  </select>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={singleYear === '' ? '' : String(singleYear)}
                    onChange={(e) => setSingleYear(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <option value="">Ano</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <CurrencyInput value={singleAmount} onValueChange={setSingleAmount} />
              </div>
              <div className="space-y-2">
                <Label>Dia de vencimento</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={singleDueDay || ''}
                  aria-invalid={!isValidDueDay(singleDueDay)}
                  onChange={(e) => setSingleDueDay(Math.trunc(Number(e.target.value)))}
                />
                {!isValidDueDay(singleDueDay) && (
                  <p className="text-xs text-destructive">Informe um dia entre 1 e 31</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring-toggle"
                  checked={singleRecurring}
                  onChange={(e) => setSingleRecurring(e.target.checked)}
                  className="size-4 rounded border-input"
                />
                <Label htmlFor="recurring-toggle" className="flex items-center gap-1.5">
                  <Repeat className="size-4" />
                  Gerar para meses seguintes
                </Label>
              </div>
              {singleRecurring && (
                <div className="space-y-2">
                  <Label>Quantidade de meses (1-12)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={singleMonths}
                    onChange={(e) => setSingleMonths(Math.min(12, Math.max(1, Number(e.target.value))))}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSingleDialogOpen(false)}>Cancelar</Button>
              <Button
                disabled={createRecurring.isPending || !singleMemberId || !monthIso(singleMonth, singleYear) || !singleAmount || !isValidDueDay(singleDueDay)}
                onClick={() => {
                  const startMonthIso = monthIso(singleMonth, singleYear)
                  if (!houseId || !startMonthIso) return
                  createRecurring.mutate({
                    houseId,
                    memberId: singleMemberId,
                    startMonth: startMonthIso,
                    amount: singleAmount,
                    dueDay: singleDueDay,
                    months: singleRecurring ? singleMonths : 1,
                  }, {
                    onSuccess: () => {
                      setSingleDialogOpen(false)
                      setSingleMemberId(''); setSingleMonth(''); setSingleYear(''); setSingleAmount(0)
                      setSingleDueDay(10); setSingleRecurring(false); setSingleMonths(1)
                    },
                  })
                }}
              >
                {createRecurring.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>}
        {canManage && <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus className="mr-1 size-4" />
                Gerar em Lote
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerar Mensalidades em Lote</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Mês de referência</Label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={bulkMonth === '' ? '' : String(bulkMonth)}
                    onChange={(e) => setBulkMonth(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <option value="">Mês</option>
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={idx} value={idx}>{name}</option>
                    ))}
                  </select>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={bulkYear === '' ? '' : String(bulkYear)}
                    onChange={(e) => setBulkYear(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <option value="">Ano</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulk-amount">Valor (R$)</Label>
                <CurrencyInput
                  id="bulk-amount"
                  value={bulkAmount}
                  onValueChange={setBulkAmount}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulk-due-date">Data de vencimento</Label>
                <DateInput
                  id="bulk-due-date"
                  value={bulkDueDate}
                  onValueChange={setBulkDueDate}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBulkDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateBulk}
                disabled={
                  createBulk.isPending ||
                  !monthIso(bulkMonth, bulkYear) ||
                  !bulkAmount ||
                  !bulkDueDate
                }
              >
                {createBulk.isPending ? 'Gerando...' : 'Gerar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>}
        </div>
      </div>

      {/* Month Navigation */}
      <MonthNavigator
        year={year}
        month={month}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
        onToday={goToToday}
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {canManage && !isLoading && filteredFees.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={allPageSelected} onCheckedChange={toggleBulkPage} aria-label="Selecionar todas desta página" />
            {bulkIds.length > 0 ? `${bulkIds.length} selecionada${bulkIds.length === 1 ? '' : 's'}` : 'Selecionar todas desta página'}
          </label>
          {bulkIds.length > 0 && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={resetBulk}>Limpar</Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                onClick={() => { setBulkConfirmText(''); setBulkDeleteOpen(true) }}
                data-testid="bulk-delete-fees"
              >
                <Trash2 className="size-4" />
                Excluir selecionadas
              </Button>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : filteredFees.length > 0 ? (
        <div className="space-y-2">
          {filteredFees.map((fee: MonthlyFeeItem) => (
            <Card key={fee.id} className={bulkIds.includes(fee.id) ? 'ring-2 ring-destructive/40' : undefined}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                {canManage && (
                  <Checkbox
                    checked={bulkIds.includes(fee.id)}
                    onCheckedChange={() => toggleBulk(fee.id)}
                    aria-label={`Selecionar mensalidade de ${fee.memberName ?? 'membro'}`}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {fee.memberName ?? 'Membro'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCompetence(fee.referenceMonth)}
                    </span>
                    <Badge variant={feeStatusVariant(fee.status)}>
                      {FEE_STATUS_LABELS[fee.status] ?? fee.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{formatCurrency(fee.amount)}</span>
                    <span>Vencimento: {formatDate(fee.dueDate)}</span>
                    {fee.paidAt && (
                      <span>Pago em: {formatDate(fee.paidAt)}</span>
                    )}
                    {fee.paymentMethod && (
                      <span>
                        {PAYMENT_METHOD_LABELS[fee.paymentMethod] ??
                          fee.paymentMethod}
                      </span>
                    )}
                  </div>
                </div>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon" className="size-8 shrink-0" />}
                    >
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {fee.status !== 'paid' && fee.status !== 'cancelled' && (
                        <>
                          <DropdownMenuItem onClick={() => openEditDialog(fee)}>
                            <Pencil className="size-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPayDialog(fee)}>
                            <Check className="size-4" />
                            Registrar pagamento
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          setDeleteFeeId(fee.id)
                          setDeleteAlertOpen(true)
                        }}
                      >
                        <Trash2 className="size-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Receipt}
          title="Nenhuma mensalidade encontrada"
          description={search ? 'Nenhum resultado para a busca.' : `Nenhuma mensalidade em ${MONTH_NAMES[month]} ${year}.`}
        />
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { resetBulk(); setPage(p) }} />

      {/* Pay Fee Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          {selectedFee && (
            <p className="text-sm text-muted-foreground">
              {selectedFee.memberName ?? 'Membro'} — {formatCurrency(selectedFee.amount)}
            </p>
          )}
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Método de pagamento</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                items={PAYMENT_METHOD_LABELS}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee-paid-at">Data do pagamento</Label>
              <DateInput id="fee-paid-at" value={feePaidAt} onValueChange={setFeePaidAt} />
              {feePaidAt > todayBRT() && (
                <p className="text-xs text-destructive">A data do pagamento não pode ser no futuro</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePayFee} disabled={payFee.isPending || !feePaidAt || feePaidAt > todayBRT()}>
              {payFee.isPending ? 'Registrando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Fee Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Mensalidade</DialogTitle>
          </DialogHeader>
          {selectedFee && (
            <p className="text-sm text-muted-foreground">
              {selectedFee.memberName ?? 'Membro'} — {formatCompetence(selectedFee.referenceMonth)}
            </p>
          )}
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Valor (R$)</Label>
              <CurrencyInput
                id="edit-amount"
                value={editAmount}
                onValueChange={setEditAmount}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-due-date">Data de vencimento</Label>
              <DateInput
                id="edit-due-date"
                value={editDueDate}
                onValueChange={setEditDueDate}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEditFee}
              disabled={updateFee.isPending || !editAmount}
            >
              {updateFee.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Fee Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir mensalidade?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A mensalidade será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (houseId && deleteFeeId) {
                  deleteFee.mutate({ houseId, feeId: deleteFeeId })
                }
                setDeleteAlertOpen(false)
                setDeleteFeeId(null)
              }}
              disabled={deleteFee.isPending}
            >
              {deleteFee.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Fees Alert */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={(open) => { setBulkDeleteOpen(open); if (!open) setBulkConfirmText('') }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {bulkSelectedFees.length} mensalidade{bulkSelectedFees.length === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {formatCompetence(referenceMonth)} · total {formatCurrency(bulkSelectedFees.reduce((acc, f) => acc + f.amount, 0))}. A exclusão não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2 text-xs">
            {bulkSelectedFees.map((f) => (
              <li key={f.id} className="flex justify-between gap-2">
                <span className="truncate">{f.memberName ?? 'Membro'}</span>
                <span className="shrink-0 text-muted-foreground">
                  {formatCurrency(f.amount)} · {FEE_STATUS_LABELS[f.status] ?? f.status}
                </span>
              </li>
            ))}
          </ul>
          {bulkPaidCount > 0 && (
            <p className="flex items-start gap-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {bulkPaidCount} {bulkPaidCount === 1 ? 'está paga' : 'estão pagas'}: o pagamento é estornado no caixa e sai da receita.
            </p>
          )}
          {bulkNeedsTyping && (
            <div className="space-y-1.5">
              <Label htmlFor="bulk-confirm">Digite EXCLUIR para confirmar</Label>
              <Input
                id="bulk-confirm"
                value={bulkConfirmText}
                autoComplete="off"
                onChange={(e) => setBulkConfirmText(e.target.value)}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={
                deleteBulk.isPending ||
                bulkSelectedFees.length === 0 ||
                (bulkNeedsTyping && bulkConfirmText.trim().toUpperCase() !== 'EXCLUIR')
              }
            >
              {deleteBulk.isPending ? 'Excluindo...' : `Excluir ${bulkSelectedFees.length}`}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ---- Pagamentos Tab ----

function PagamentosTab() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const canManage = useAuthStore((s) => s.hasPermission('canManageCashier'))
  // Lançamento avulso: caixa/canRegisterInternalPayments lançam entrada e saída;
  // canRegisterSales só entrada; membro comum não lança (regra do back).
  const canExpense = useAuthStore((s) => s.hasPermission('canManageCashier') || s.hasPermission('canRegisterInternalPayments'))
  const canCreatePayment = useAuthStore((s) => s.hasPermission('canManageCashier') || s.hasPermission('canRegisterInternalPayments') || s.hasPermission('canRegisterSales'))
  const now = currentYearMonthBRT()
  const [page, setPage] = useState(1)
  const [year, setYear] = useState(now.year)
  const [month, setMonth] = useState(now.month)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null)
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagType, setNewTagType] = useState<PaymentTagType>('both')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Create form state
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [type, setType] = useState<PaymentType>('income')
  const [category, setCategory] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [paidAt, setPaidAt] = useState(todayBRT())

  const { data, isLoading, isError, refetch } = usePayments(page, undefined, categoryFilter || undefined)
  const createPayment = useCreatePayment()
  const deletePayment = useDeletePayment()
  const { data: tags } = usePaymentTags()
  const createTag = useCreatePaymentTag()
  const deleteTag = useDeletePaymentTag()

  const payments = data?.data ?? []
  const [paymentSearch, setPaymentSearch] = useState('')

  const filteredPayments = useMemo(() => {
    const prefix = formatYearMonth(year, month)

    // Mês pela data real do pagamento (paidAt), em BRT
    const when = (p: PaymentItem) => p.paidAt || p.createdAt
    let merged = payments
      .filter((p) => civilDateOf(when(p)).startsWith(prefix))
      .sort((a, b) => dateSortKey(when(b)) - dateSortKey(when(a)))

    if (paymentSearch.trim()) {
      const term = paymentSearch.toLowerCase()
      merged = merged.filter((p) =>
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term),
      )
    }
    return merged
  }, [payments, year, month, paymentSearch])

  const ITEMS_PER_PAGE = 20
  const paymentTotalPages = Math.max(1, Math.ceil(filteredPayments.length / ITEMS_PER_PAGE))
  const paginatedPayments = filteredPayments.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const goToPrevMonth = () => {
    setPage(1)
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const goToNextMonth = () => {
    setPage(1)
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }
  const goToToday = () => {
    setPage(1)
    setYear(now.year)
    setMonth(now.month)
  }

  const handleCreate = () => {
    if (!houseId || description.trim().length < 3 || !amount || !category) return
    if (type === 'expense' && !canExpense) return
    createPayment.mutate(
      {
        houseId,
        description,
        amount,
        type,
        category,
        paymentMethod: method,
        paidAt: paidAt || undefined,
      },
      {
        onSettled: (_, error) => {
          if (!error) {
            setDialogOpen(false)
            setDescription('')
            setAmount(0)
            setType('income')
            setCategory('')
            setMethod('pix')
            setPaidAt(todayBRT())
          }
        },
      },
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar pagamentos"
        message="Não foi possível carregar a lista de pagamentos."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Registre receitas e despesas da casa
        </p>
        {canCreatePayment && <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus className="mr-1 size-4" />
                Novo Pagamento
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Pagamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="pay-description">Descrição</Label>
                <Input
                  id="pay-description"
                  placeholder="Descrição do pagamento"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-amount">Valor (R$)</Label>
                <CurrencyInput
                  id="pay-amount"
                  value={amount}
                  onValueChange={setAmount}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as PaymentType)}
                  items={{ income: 'Receita', expense: 'Despesa' }}
                  disabled={!canExpense}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    {canExpense && <SelectItem value="expense">Despesa</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v ?? '')}
                  items={Object.fromEntries((tags ?? []).map((t) => [t.name, t.name]))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {(tags ?? [])
                      .filter((t) => t.type === 'both' || t.type === type)
                      .map((tag) => (
                        <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Ou digite uma nova categoria"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Método de pagamento</Label>
                <Select
                  value={method}
                  onValueChange={(v) => setMethod(v as PaymentMethod)}
                  items={PAYMENT_METHOD_LABELS}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(
                      ([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 pb-2">
              <Label htmlFor="pay-paid-at">Data do pagamento</Label>
              <DateInput id="pay-paid-at" value={paidAt} onValueChange={setPaidAt} />
              {paidAt > todayBRT() && (
                <p className="text-xs text-destructive">A data do pagamento não pode ser no futuro</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  createPayment.isPending ||
                  description.trim().length < 3 ||
                  !amount ||
                  !category ||
                  !paidAt ||
                  paidAt > todayBRT()
                }
              >
                {createPayment.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>}
      </div>

      {/* Month Navigation */}
      <MonthNavigator
        year={year}
        month={month}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
        onToday={goToToday}
      />

      {/* Filter by tag + manage tags */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={categoryFilter || 'all'}
          onValueChange={(v) => { setCategoryFilter(v === 'all' ? '' : v ?? ''); setPage(1) }}
          items={{ all: 'Todas categorias', ...Object.fromEntries((tags ?? []).map((t) => [t.name, categoryLabel(t.name)])) }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {(tags ?? []).map((tag) => (
              <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {canManage && (
          <Dialog open={tagsDialogOpen} onOpenChange={setTagsDialogOpen}>
            <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
              <Settings className="size-4" />
              Tags
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gerenciar Tags</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome da tag"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={newTagType}
                    onValueChange={(v) => setNewTagType(v as PaymentTagType)}
                    items={{ both: 'Ambos', income: 'Receita', expense: 'Despesa' }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Ambos</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={!newTagName.trim() || !houseId || createTag.isPending}
                    onClick={() => {
                      if (!houseId) return
                      createTag.mutate({ houseId, name: newTagName.trim(), type: newTagType }, {
                        onSuccess: () => setNewTagName(''),
                      })
                    }}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <div className="max-h-60 space-y-1 overflow-y-auto">
                  {(tags ?? []).map((tag) => (
                    <div key={tag.id} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{tag.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {tag.type === 'both' ? 'Ambos' : tag.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={deleteTag.isPending}
                        onClick={() => houseId && deleteTag.mutate({ houseId, tagId: tag.id })}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                  {(tags ?? []).length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma tag criada</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por descrição ou categoria..."
          value={paymentSearch}
          onChange={(e) => { setPaymentSearch(e.target.value); setPage(1) }}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : paginatedPayments.length > 0 ? (
        <div className="space-y-2">
          {paginatedPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {payment.description}
                    </span>
                    <Badge
                      variant={
                        payment.type === 'income' ? 'default' : 'destructive'
                      }
                    >
                      {PAYMENT_TYPE_LABELS[payment.type]}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{formatCurrency(payment.amount)}</span>
                    <span>{categoryLabel(payment.category)}</span>
                    {payment.paymentMethod && (
                      <span>
                        {PAYMENT_METHOD_LABELS[payment.paymentMethod] ??
                          payment.paymentMethod}
                      </span>
                    )}
                    {(payment.paidAt || payment.createdAt) && <span>{formatDate(payment.paidAt || payment.createdAt)}</span>}
                  </div>
                </div>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon" className="size-8 shrink-0" />}
                    >
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          setDeletePaymentId(payment.id)
                          setDeleteAlertOpen(true)
                        }}
                      >
                        <Trash2 className="size-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={DollarSign}
          title="Nenhum pagamento encontrado"
          description={`Nenhum pagamento em ${MONTH_NAMES[month]} ${year}.`}
        />
      )}

      <Pagination page={page} totalPages={paymentTotalPages} onPageChange={setPage} />

      {/* Delete Payment Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pagamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O pagamento será removido e os contadores serão atualizados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (houseId && deletePaymentId) {
                  deletePayment.mutate({ houseId, paymentId: deletePaymentId })
                }
                setDeleteAlertOpen(false)
                setDeletePaymentId(null)
              }}
              disabled={deletePayment.isPending}
            >
              {deletePayment.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

// ---- Dividas Tab ----

function DividasTab() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const canManage = useAuthStore((s) => s.hasPermission('canManageCashier'))
  const now = currentYearMonthBRT()
  const [page, setPage] = useState(1)
  const [year, setYear] = useState(now.year)
  const [month, setMonth] = useState(now.month)
  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deleteDebtId, setDeleteDebtId] = useState<string | null>(null)
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null)

  // Create form state
  const [debtMemberId, setDebtMemberId] = useState('')
  const [debtDescription, setDebtDescription] = useState('')
  const [debtAmount, setDebtAmount] = useState(0)
  const [debtDueDate, setDebtDueDate] = useState('')

  // Pay form state
  const [payAmount, setPayAmount] = useState(0)
  const [payMethod, setPayMethod] = useState<PaymentMethod>('pix')
  const [payPaidAt, setPayPaidAt] = useState(todayBRT())

  // Edit form state
  const [editDebt, setEditDebt] = useState<DebtItem | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editAmount, setEditAmount] = useState(0)
  const updateDebt = useUpdateDebt()
  // Valor só pode mudar enquanto não houve pagamento (regra do back).
  const editHasPayment = !!editDebt && Math.round(editDebt.remainingAmount * 100) !== Math.round(editDebt.amount * 100)

  const openEditDebt = (debt: DebtItem) => {
    setEditDebt(debt)
    setEditDescription(debt.description)
    setEditDueDate(debt.dueDate ? civilDateOf(debt.dueDate) : '')
    setEditAmount(debt.amount)
  }

  const handleEditDebt = () => {
    if (!houseId || !editDebt) return
    const prevDue = editDebt.dueDate ? civilDateOf(editDebt.dueDate) : ''
    updateDebt.mutate(
      {
        houseId,
        debtId: editDebt.id,
        ...(editDescription.trim() !== editDebt.description ? { description: editDescription.trim() } : {}),
        ...(editDueDate !== prevDue ? { dueDate: editDueDate } : {}),
        ...(!editHasPayment && Math.round(editAmount * 100) !== Math.round(editDebt.amount * 100) ? { amount: editAmount } : {}),
      },
      { onSuccess: () => setEditDebt(null) },
    )
  }

  const { data, isLoading, isError, refetch } = useDebts(page)
  const { data: membersData } = useAllMembers()
  const createDebt = useCreateDebt()
  const payDebt = usePayDebt()
  const deleteDebt = useDeleteDebt()

  const members = useMemo(() => membersData?.data ?? [], [membersData])
  const memberItems = useMemo(() =>
    Object.fromEntries(members.map((m) => [m.id, m.fullName])),
    [members],
  )

  const debts = useMemo(() => data?.data ?? [], [data])
  const totalPages = data?.pagination?.totalPages ?? 1
  const selectedDebt = debts.find((d) => d.id === selectedDebtId) ?? null
  const payExceeds = !!selectedDebt && payAmount > selectedDebt.remainingAmount

  const filteredDebts = useMemo(() => {
    const prefix = formatYearMonth(year, month)
    let filtered = debts.filter((d) => civilDateOf(d.createdAt).startsWith(prefix))
    if (search.trim()) {
      const term = search.toLowerCase()
      filtered = filtered.filter((debt) =>
        debt.memberName?.toLowerCase().includes(term) ||
        debt.description.toLowerCase().includes(term),
      )
    }
    return filtered
  }, [debts, year, month, search])

  const goToPrevMonth = () => {
    setPage(1)
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const goToNextMonth = () => {
    setPage(1)
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }
  const goToToday = () => {
    setPage(1)
    setYear(now.year)
    setMonth(now.month)
  }

  const handleCreateDebt = () => {
    if (!houseId || !debtMemberId || !debtDescription || !debtAmount) return
    createDebt.mutate(
      {
        houseId,
        memberId: debtMemberId,
        description: debtDescription,
        amount: debtAmount,
        dueDate: debtDueDate || undefined,
      },
      {
        onSettled: (_, error) => {
          if (!error) {
            setCreateDialogOpen(false)
            setDebtMemberId('')
            setDebtDescription('')
            setDebtAmount(0)
            setDebtDueDate('')
          }
        },
      },
    )
  }

  const handlePayDebt = () => {
    if (!houseId || !selectedDebtId || !payAmount) return
    if (selectedDebt && payAmount > selectedDebt.remainingAmount) return
    payDebt.mutate(
      {
        houseId,
        debtId: selectedDebtId,
        amount: payAmount,
        paymentMethod: payMethod,
        paidAt: payPaidAt || undefined,
      },
      {
        onSettled: (_, error) => {
          if (!error) {
            setPayDialogOpen(false)
            setSelectedDebtId(null)
            setPayAmount(0)
            setPayMethod('pix')
          }
        },
      },
    )
  }

  const openPayDialog = (debt: DebtItem) => {
    setSelectedDebtId(debt.id)
    setPayAmount(debt.remainingAmount)
    setPayMethod('pix')
    setPayPaidAt(todayBRT())
    setPayDialogOpen(true)
  }

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar dívidas"
        message="Não foi possível carregar a lista de dívidas."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Controle as dívidas dos membros
        </p>
        {canManage && <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus className="mr-1 size-4" />
                Nova Dívida
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Dívida</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Membro</Label>
                <Select
                  value={debtMemberId}
                  onValueChange={(v) => v && setDebtMemberId(v)}
                  items={memberItems}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id} label={member.fullName}>
                        {member.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="debt-description">Descrição</Label>
                <Input
                  id="debt-description"
                  placeholder="Descrição da dívida"
                  value={debtDescription}
                  onChange={(e) => setDebtDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debt-amount">Valor (R$)</Label>
                <CurrencyInput
                  id="debt-amount"
                  value={debtAmount}
                  onValueChange={setDebtAmount}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debt-due-date">
                  Data de vencimento (opcional)
                </Label>
                <DateInput
                  id="debt-due-date"
                  value={debtDueDate}
                  onValueChange={setDebtDueDate}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateDebt}
                disabled={
                  createDebt.isPending ||
                  !debtMemberId ||
                  !debtDescription ||
                  !debtAmount
                }
              >
                {createDebt.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>}
      </div>

      {/* Month Navigation */}
      <MonthNavigator
        year={year}
        month={month}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
        onToday={goToToday}
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : filteredDebts.length > 0 ? (
        <div className="space-y-2">
          {filteredDebts.map((debt: DebtItem) => (
            <Card key={debt.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {debt.memberName ?? 'Membro'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {debt.description}
                    </span>
                    <Badge variant={feeStatusVariant(debt.status)}>
                      {FEE_STATUS_LABELS[debt.status] ?? debt.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>Total: {formatCurrency(debt.amount)}</span>
                    <span>
                      Restante: {formatCurrency(debt.remainingAmount)}
                    </span>
                    {debt.dueDate && (
                      <span>Vencimento: {formatDate(debt.dueDate)}</span>
                    )}
                    <span>Criado em: {formatDate(debt.createdAt)}</span>
                  </div>
                </div>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon" className="size-8 shrink-0" />}
                    >
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {debt.status !== 'paid' && debt.status !== 'cancelled' && (
                        <>
                          <DropdownMenuItem onClick={() => openEditDebt(debt)}>
                            <Pencil className="size-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPayDialog(debt)}>
                            <CreditCard className="size-4" />
                            Registrar pagamento
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          setDeleteDebtId(debt.id)
                          setDeleteAlertOpen(true)
                        }}
                      >
                        <Trash2 className="size-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={AlertTriangle}
          title="Nenhuma dívida encontrada"
          description={search ? 'Nenhum resultado para a busca.' : `Nenhuma dívida em ${MONTH_NAMES[month]} ${year}.`}
        />
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Edit Debt Dialog */}
      <Dialog open={!!editDebt} onOpenChange={(open) => { if (!open) setEditDebt(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar dívida</DialogTitle>
          </DialogHeader>
          {editDebt && (
            <p className="text-sm text-muted-foreground">{editDebt.memberName ?? 'Membro'}</p>
          )}
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-debt-description">Descrição</Label>
              <Input
                id="edit-debt-description"
                value={editDescription}
                maxLength={200}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              {editDescription.trim().length > 0 && editDescription.trim().length < 3 && (
                <p className="text-xs text-destructive">Use pelo menos 3 caracteres</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-debt-due">Vencimento</Label>
              <div className="flex items-center gap-2">
                <DateInput id="edit-debt-due" value={editDueDate} onValueChange={setEditDueDate} />
                {editDueDate && (
                  <Button variant="ghost" size="sm" onClick={() => setEditDueDate('')}>Sem vencimento</Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-debt-amount">Valor (R$)</Label>
              <CurrencyInput
                id="edit-debt-amount"
                value={editAmount}
                onValueChange={setEditAmount}
                disabled={editHasPayment}
              />
              {editHasPayment && (
                <p className="text-xs text-muted-foreground">
                  Esta dívida já tem pagamento: o valor não pode mudar. Para corrigir, exclua o pagamento antes.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDebt(null)}>Cancelar</Button>
            <Button
              onClick={handleEditDebt}
              disabled={updateDebt.isPending || editDescription.trim().length < 3 || (!editHasPayment && !editAmount)}
            >
              {updateDebt.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Debt Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento de Dívida</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="pay-debt-amount">Valor do pagamento (R$)</Label>
              <CurrencyInput
                id="pay-debt-amount"
                value={payAmount}
                onValueChange={setPayAmount}
                aria-invalid={payExceeds}
              />
              {selectedDebt && (
                <p className={payExceeds ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>
                  {payExceeds ? 'Valor acima do restante: ' : 'Restante: '}
                  {formatCurrency(selectedDebt.remainingAmount)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-debt-paid-at">Data do pagamento</Label>
              <DateInput id="pay-debt-paid-at" value={payPaidAt} onValueChange={setPayPaidAt} />
              {payPaidAt > todayBRT() && (
                <p className="text-xs text-destructive">A data do pagamento não pode ser no futuro</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Método de pagamento</Label>
              <Select
                value={payMethod}
                onValueChange={(v) => setPayMethod(v as PaymentMethod)}
                items={PAYMENT_METHOD_LABELS}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handlePayDebt}
              disabled={payDebt.isPending || !payAmount || payExceeds || !payPaidAt || payPaidAt > todayBRT()}
            >
              {payDebt.isPending ? 'Registrando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Debt Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir dívida?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A dívida será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (houseId && deleteDebtId) {
                  deleteDebt.mutate({ houseId, debtId: deleteDebtId })
                }
                setDeleteAlertOpen(false)
                setDeleteDebtId(null)
              }}
              disabled={deleteDebt.isPending}
            >
              {deleteDebt.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ---- Main Page ----

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('mensalidades')
  const houseId = useAuthStore((s) => s.currentHouseId())
  const canManage = useAuthStore((s) => s.hasPermission('canManageCashier'))
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const now = currentYearMonthBRT()
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportYear, setExportYear] = useState(now.year)
  const [exportMonth, setExportMonth] = useState(now.month)
  const [exporting, setExporting] = useState(false)
  const recalculate = useRecalculateHouseSummary()
  const { data: allMembersData } = useAllMembers()

  const handleExportCSV = async () => {
    if (!houseId) return
    setExporting(true)
    try {
      const { start, end } = monthCivilRange(exportYear, exportMonth)
      const entries = await fetchStatementEntries({ houseId, startDate: start, endDate: end })
      if (entries.length === 0) {
        toast.info('Nenhum lançamento no período')
        return
      }
      const names = new Map((allMembersData?.data ?? []).map((m) => [m.id, m.fullName]))
      const rows = statementCsvRows(entries, (id) => (id ? names.get(id) ?? '' : ''))
      downloadCSV(`financeiro_${MONTH_NAMES[exportMonth]}_${exportYear}.csv`, STATEMENT_CSV_HEADERS, rows)
      setExportDialogOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erro ao exportar o extrato'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Financeiro
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie mensalidades, pagamentos e dívidas da casa
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={recalculate.isPending || !houseId}
              onClick={() => recalculate.mutate()}
            >
              <RefreshCw className={`size-4 ${recalculate.isPending ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{recalculate.isPending ? 'Recalculando...' : 'Recalcular saldo'}</span>
            </Button>
          )}
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger
              render={<Button variant="outline" size="sm" className="gap-2" disabled={!houseId} />}
            >
              <Download className="size-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exportar extrato</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Todos os lançamentos do mês (mensalidades, pagamentos, dívidas, vendas, rifas, listas e estornos).
              </p>
              <div className="grid grid-cols-2 gap-2 py-2">
                <select
                  aria-label="Mês"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={exportMonth}
                  onChange={(e) => setExportMonth(Number(e.target.value))}
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
                <select
                  aria-label="Ano"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={exportYear}
                  onChange={(e) => setExportYear(Number(e.target.value))}
                >
                  {[now.year - 2, now.year - 1, now.year, now.year + 1].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleExportCSV} disabled={exporting} className="gap-2">
                  <Download className="size-4" />
                  {exporting ? 'Exportando...' : 'Exportar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Ledger navigation (admin-only) */}
      {canManage && (
        <div className="flex flex-wrap gap-2">
          <Link href={ROUTES.ADMIN_FINANCE_HEALTH}>
            <Button variant="outline" size="sm" className="gap-2">
              <ShieldCheck className="size-4" />
              Saúde
            </Button>
          </Link>
          <Link href={ROUTES.ADMIN_FINANCE_AUDIT}>
            <Button variant="outline" size="sm" className="gap-2">
              <FileSearch className="size-4" />
              Auditoria
            </Button>
          </Link>
          {isAdmin && (
            <Link href={ROUTES.ADMIN_FINANCE_BACKFILL}>
              <Button variant="outline" size="sm" className="gap-2">
                <Database className="size-4" />
                Backfill
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Separator />

      {/* Tab Content */}
      {activeTab === 'mensalidades' && <MensalidadesTab />}
      {activeTab === 'pagamentos' && <PagamentosTab />}
      {activeTab === 'dividas' && <DividasTab />}
    </div>
  )
}

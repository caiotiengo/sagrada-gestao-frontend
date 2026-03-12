'use client'

import { useState, useMemo, useCallback } from 'react'
import { ClipboardCheck, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCheckins, useRegisterBulkCheckin } from '@/hooks/use-checkins'
import { useAllMembers } from '@/hooks/use-members'
import { useAuthStore } from '@/stores/auth'
import { CHECKIN_TYPE_LABELS } from '@/constants'
import type { CheckinType } from '@/types'
import { formatDateTime } from '@/utils'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

const CHECKIN_TYPES: CheckinType[] = ['gira', 'evento', 'desenvolvimento', 'outro']

const TYPE_BADGE_VARIANT: Record<CheckinType, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  gira: 'default',
  evento: 'secondary',
  desenvolvimento: 'outline',
  outro: 'outline',
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function getMonthRange(year: number, month: number, day?: number) {
  if (day) {
    const d = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return { startDate: d, endDate: d }
  }
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { startDate, endDate }
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

export default function AdminCheckinsPage() {
  const houseId = useAuthStore((s) => s.currentHouseId())

  const now = new Date()
  const [page, setPage] = useState(1)
  const [filterType, setFilterType] = useState<CheckinType | undefined>(undefined)
  const [filterYear, setFilterYear] = useState(now.getFullYear())
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1)
  const [filterDay, setFilterDay] = useState<number | undefined>(undefined)
  const [nameSearch, setNameSearch] = useState('')

  const { startDate, endDate } = useMemo(
    () => getMonthRange(filterYear, filterMonth, filterDay),
    [filterYear, filterMonth, filterDay],
  )

  const { data, isLoading, isError, refetch } = useCheckins(page, undefined, filterType, startDate, endDate)

  const daysInMonth = useMemo(() => getDaysInMonth(filterYear, filterMonth), [filterYear, filterMonth])
  const dayItems = useMemo(() => {
    const items: Record<string, string> = { all: 'Todos os dias' }
    for (let d = 1; d <= daysInMonth; d++) items[String(d)] = String(d)
    return items
  }, [daysInMonth])

  const prevMonth = useCallback(() => {
    setPage(1)
    setFilterDay(undefined)
    if (filterMonth === 1) { setFilterMonth(12); setFilterYear((y) => y - 1) }
    else setFilterMonth((m) => m - 1)
  }, [filterMonth])

  const nextMonth = useCallback(() => {
    setPage(1)
    setFilterDay(undefined)
    if (filterMonth === 12) { setFilterMonth(1); setFilterYear((y) => y + 1) }
    else setFilterMonth((m) => m + 1)
  }, [filterMonth])

  // Load all members (page 1 with large implicit limit) for name mapping and dialog
  const { data: membersData } = useAllMembers()

  const checkins = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1

  const members = membersData?.data ?? []
  const memberMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of members) {
      map.set(m.id, m.fullName)
    }
    return map
  }, [members])

  const filteredCheckins = useMemo(() => {
    if (!nameSearch.trim()) return checkins
    const query = nameSearch.toLowerCase()
    return checkins.filter((c) => {
      const name = memberMap.get(c.memberId) ?? ''
      return name.toLowerCase().includes(query)
    })
  }, [checkins, nameSearch, memberMap])

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<CheckinType>('gira')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [memberSearch, setMemberSearch] = useState('')

  const bulkCheckin = useRegisterBulkCheckin()

  const filteredDialogMembers = memberSearch.trim()
    ? members.filter((m) =>
        m.fullName.toLowerCase().includes(memberSearch.toLowerCase()),
      )
    : members

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    )
  }

  const toggleAll = () => {
    const visibleIds = filteredDialogMembers.map((m) => m.id)
    const allSelected = visibleIds.every((id) => selectedMemberIds.includes(id))
    if (allSelected) {
      setSelectedMemberIds((prev) => prev.filter((id) => !visibleIds.includes(id)))
    } else {
      setSelectedMemberIds((prev) => [...new Set([...prev, ...visibleIds])])
    }
  }

  const handleSubmit = () => {
    if (!houseId || selectedMemberIds.length === 0) return

    bulkCheckin.mutate(
      {
        houseId,
        memberIds: selectedMemberIds,
        type: selectedType,
      },
      {
        onSuccess: () => {
          setDialogOpen(false)
          setSelectedMemberIds([])
          setSelectedType('gira')
          setMemberSearch('')
        },
      },
    )
  }

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedMemberIds([])
      setSelectedType('gira')
      setMemberSearch('')
    }
  }

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar check-ins"
        message="Não foi possível carregar o histórico de check-ins. Tente novamente."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Check-ins
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Histórico de presenças e registro em lote
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="mr-1.5 size-4" />
            Registrar Presença
          </DialogTrigger>

          <DialogContent className="max-h-[85dvh] overflow-hidden sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Presença</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 overflow-y-auto py-2">
              {/* Type select */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo</label>
                <Select
                  value={selectedType}
                  onValueChange={(v) => setSelectedType(v as CheckinType)}
                  items={CHECKIN_TYPE_LABELS}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHECKIN_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {CHECKIN_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Member selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Membros ({selectedMemberIds.length} selecionados)
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleAll}
                    className="h-auto px-2 py-1 text-xs"
                  >
                    Selecionar todos
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar membro..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="max-h-52 space-y-1 overflow-y-auto rounded-md border p-2">
                  {filteredDialogMembers.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Nenhum membro encontrado
                    </p>
                  ) : (
                    filteredDialogMembers.map((member) => (
                      <label
                        key={member.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                      >
                        <Checkbox
                          checked={selectedMemberIds.includes(member.id)}
                          onCheckedChange={() => toggleMember(member.id)}
                        />
                        <span className="text-sm">{member.fullName}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose render={<Button variant="outline" />}>
                Cancelar
              </DialogClose>
              <Button
                onClick={handleSubmit}
                disabled={selectedMemberIds.length === 0 || bulkCheckin.isPending}
              >
                {bulkCheckin.isPending ? 'Registrando...' : 'Registrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8" onClick={prevMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-medium">
            {MONTH_NAMES[filterMonth - 1]} {filterYear}
          </span>
          <Button variant="ghost" size="icon" className="size-8" onClick={nextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filterDay != null ? String(filterDay) : 'all'}
          onValueChange={(v) => {
            setFilterDay(v === 'all' ? undefined : Number(v))
            setPage(1)
          }}
          items={dayItems}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Dia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os dias</SelectItem>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterType ?? 'all'}
          onValueChange={(v) => {
            setFilterType(v === 'all' ? undefined : (v as CheckinType))
            setPage(1)
          }}
          items={{ all: 'Todos os tipos', ...CHECKIN_TYPE_LABELS }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {CHECKIN_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {CHECKIN_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Check-in list */}
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : filteredCheckins.length > 0 ? (
        <div className="space-y-2">
          {filteredCheckins.map((checkin) => (
            <Card key={checkin.id}>
              <CardContent className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-medium">
                    {memberMap.get(checkin.memberId) ?? 'Membro desconhecido'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(checkin.checkinAt)}
                  </p>
                </div>
                <Badge variant={TYPE_BADGE_VARIANT[checkin.type]}>
                  {CHECKIN_TYPE_LABELS[checkin.type] ?? checkin.type}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardCheck}
          title="Nenhum check-in registrado"
          description="Registre presenças utilizando o botão acima."
          className="min-h-[30dvh]"
        />
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setPage((p) => p + 1)}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  )
}

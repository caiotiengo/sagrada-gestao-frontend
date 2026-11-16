'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Database,
  Loader2,
  FileSearch,
  ShieldCheck,
} from 'lucide-react'
import { useBackfillLedger } from '@/hooks/use-ledger'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency } from '@/utils'
import { getErrorMessage } from '@/lib/errors'
import { SOURCE_LABELS } from '@/lib/ledger-labels'
import type { LedgerSource, BackfillResult } from '@/types/ledger'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ErrorState } from '@/components/feedback/error-state'

export default function BackfillPage() {
  // backfillHouseLedger é só para admin no back
  const canManage = useAuthStore((s) => s.isAdmin())
  const houseName = useAuthStore((s) => s.currentHouse?.houseName) ?? ''

  const [confirmText, setConfirmText] = useState('')
  const [result, setResult] = useState<BackfillResult | null>(null)
  const backfill = useBackfillLedger()

  if (!canManage) {
    return (
      <ErrorState
        title="Acesso restrito"
        message="Você não tem permissão para acessar esta página."
      />
    )
  }

  const expectedPhrase = `BACKFILL ${houseName}`.trim().toUpperCase()
  const isConfirmed = confirmText.trim().toUpperCase() === expectedPhrase

  const handleRun = () => {
    if (!isConfirmed) return
    backfill.mutate(undefined, {
      onSuccess: (data) => {
        setResult(data)
        setConfirmText('')
      },
    })
  }

  const drift = result?.validation?.drift?.net ?? 0
  const hasLargeDrift = Math.abs(drift) > 1

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <Link href={ROUTES.ADMIN_FINANCE}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="size-4" />
          Voltar ao financeiro
        </Button>
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
          <Database className="size-6" />
          Backfill do Ledger
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reconstrói o ledger a partir do histórico de entidades (mensalidades, vendas, dívidas, cotas, contribuições, rifas, trabalhos).
        </p>
      </div>

      {/* Warning banner */}
      <Card className="border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Ação crítica. Rode em janela de manutenção.
            </p>
            <p className="text-amber-800 dark:text-amber-200">
              Este processo lê todas as entidades pagas e cria entradas no ledger retroativamente.
              É <strong>idempotente</strong> — rodar duas vezes não gera duplicatas. Mas pode levar até 5 minutos
              para casas grandes.
            </p>
            <p className="text-amber-800 dark:text-amber-200">
              Após rodar, compare os totais exibidos com o que você tinha antes. Qualquer
              discrepância maior que R$ 1,00 deve ser investigada.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation */}
      {!result && (
        <Card>
          <CardHeader>
            <CardTitle>Confirmação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Para confirmar, digite <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                {expectedPhrase}
              </code> abaixo:
            </p>
            <Input
              placeholder={expectedPhrase}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
            />
            <Button
              variant="destructive"
              onClick={handleRun}
              disabled={!isConfirmed || backfill.isPending}
              className="gap-2"
            >
              {backfill.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processando... (pode levar alguns minutos)
                </>
              ) : (
                <>
                  <Database className="size-4" />
                  Rodar Backfill
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {backfill.isError && (
        <Card className="border-destructive">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="size-5 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Erro ao executar backfill</p>
              <p className="text-sm text-muted-foreground">
                {getErrorMessage(backfill.error, 'Erro desconhecido')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <>
          <Card
            className={
              result.validation.isBalanced && !hasLargeDrift
                ? 'border-emerald-300'
                : 'border-amber-300'
            }
          >
            <CardContent className="flex items-start gap-3 p-5">
              {result.validation.isBalanced && !hasLargeDrift ? (
                <CheckCircle2 className="size-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="size-6 shrink-0 text-amber-600 dark:text-amber-400" />
              )}
              <div className="space-y-1">
                <p className="text-lg font-semibold">
                  {result.validation.isBalanced && !hasLargeDrift
                    ? 'Backfill concluído com sucesso'
                    : 'Backfill concluído com divergências'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {result.backfill.totalCreated} ajuste(s) lançado(s),{' '}
                  {result.backfill.totalSkipped} registro(s) já batiam com o ledger.
                </p>
                {hasLargeDrift && (
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Drift líquido: {formatCurrency(drift)} — investigue na auditoria.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Criados por tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(Object.keys(result.backfill.created) as LedgerSource[]).map((source) => (
                  <div key={source} className="rounded-md bg-muted/40 px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      {SOURCE_LABELS[source] ?? source}
                    </p>
                    <p className="text-sm font-semibold">
                      {result.backfill.created[source] ?? 0} criados
                    </p>
                    {!!result.backfill.skipped[source] && (
                      <p className="text-xs text-muted-foreground">
                        {result.backfill.skipped[source]} já existiam
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {(result.backfill.drift ?? []).length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Ledger acima do registro ({result.backfill.drift.length}) — estorne na auditoria
                  </p>
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-md bg-muted/40 p-2 text-xs">
                    {result.backfill.drift.slice(0, 20).map((d) => (
                      <div key={`${d.source}-${d.sourceId}`} className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-[0.625rem]">
                          {SOURCE_LABELS[d.source as LedgerSource] ?? d.source}
                        </Badge>
                        <span className="font-mono">{d.sourceId.slice(0, 10)}…</span>
                        <span className="flex-1 text-muted-foreground">
                          esperado {formatCurrency(d.expected)} · no ledger {formatCurrency(d.ledger)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(result.backfill.ambiguous ?? []).length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
                    Casos ambíguos ({result.backfill.ambiguous.length}) — revisar manualmente
                  </p>
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-md bg-muted/40 p-2 text-xs">
                    {result.backfill.ambiguous.slice(0, 20).map((a) => (
                      <div key={`${a.source}-${a.sourceId}`} className="flex gap-2">
                        <Badge variant="destructive" className="text-[0.625rem]">
                          {SOURCE_LABELS[a.source as LedgerSource] ?? a.source}
                        </Badge>
                        <span className="font-mono">{a.sourceId.slice(0, 10)}…</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Link href={ROUTES.ADMIN_FINANCE_HEALTH}>
              <Button variant="outline" className="gap-2">
                <ShieldCheck className="size-4" />
                Ver Saúde Financeira
              </Button>
            </Link>
            <Link href={ROUTES.ADMIN_FINANCE_AUDIT}>
              <Button variant="outline" className="gap-2">
                <FileSearch className="size-4" />
                Auditoria do Ledger
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

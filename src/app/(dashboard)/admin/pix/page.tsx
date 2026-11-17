'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Info, QrCode, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import { housePaymentService, type HousePaymentInfo, type PixKeyType } from '@/services/house-payment'
import { getErrorMessage } from '@/lib/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/feedback/error-state'

const TYPES: { value: PixKeyType; label: string; placeholder: string }[] = [
  { value: 'cpf', label: 'CPF', placeholder: '000.000.000-00' },
  { value: 'cnpj', label: 'CNPJ', placeholder: '00.000.000/0000-00' },
  { value: 'phone', label: 'Telefone', placeholder: '(11) 99999-9999' },
  { value: 'email', label: 'E-mail', placeholder: 'casa@exemplo.com' },
  { value: 'random', label: 'Aleatória', placeholder: '00000000-0000-0000-0000-000000000000' },
]

const typeLabel = (t: string) => TYPES.find((x) => x.value === t)?.label ?? t

export default function HousePixPage() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const qc = useQueryClient()
  const key = ['house', houseId, 'paymentInfo']

  const info = useQuery({
    queryKey: key,
    queryFn: () => housePaymentService.getPaymentInfo(houseId!),
    enabled: !!houseId,
  })

  // O formulário começa com a chave atual; `key` remonta quando ela muda.
  const formKey = info.data ? `${info.data.pixKeyType}:${info.data.pixKey}:${info.data.receiverName ?? ''}` : 'vazio'

  const current = info.data

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Chave PIX da casa</h1>
        <p className="text-sm text-muted-foreground">Aparece para os membros no app, em &quot;O que eu devo&quot;, para pagarem direto à casa.</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200" data-testid="pix-disclaimer">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          O Sagrada Gestão não processa pagamentos; a casa registra o recebimento. O dinheiro vai direto para a conta da
          chave abaixo. Quando o filho envia o comprovante, a baixa é automática se tudo confere (inclusive esta chave);
          se não, ele aparece em Comprovantes para a liderança conferir.
        </p>
      </div>

      {info.isError ? (
        <ErrorState message={getErrorMessage(info.error, 'Não foi possível carregar a chave PIX')} onRetry={() => info.refetch()} />
      ) : info.isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <>
          <section className="rounded-xl border bg-card p-4 sm:p-5" data-testid="pix-current">
            <h2 className="mb-2 text-sm font-semibold">Chave atual</h2>
            {current ? (
              <div className="flex flex-wrap items-center gap-3">
                <QrCode className="size-5 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="break-all font-mono text-sm" data-testid="pix-current-key">{current.pixKey}</p>
                  <p className="text-xs text-muted-foreground">
                    {typeLabel(current.pixKeyType)}
                    {current.receiverName ? ` · ${current.receiverName}` : ''}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard?.writeText(current.pixKey).then(() => toast.success('Chave copiada'))}
                >
                  <Copy className="size-3.5" /> Copiar
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="pix-empty">Nenhuma chave cadastrada. Os membros ainda não veem como pagar pelo app.</p>
            )}
          </section>

          <PixForm key={formKey} houseId={houseId!} current={current ?? null} onSaved={(p) => qc.setQueryData(key, p)} />
        </>
      )}
    </div>
  )
}

function PixForm({
  houseId,
  current,
  onSaved,
}: {
  houseId: string
  current: HousePaymentInfo | null
  onSaved: (p: HousePaymentInfo | null) => void
}) {
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>(current?.pixKeyType ?? 'email')
  const [pixKey, setPixKey] = useState(current?.pixKey ?? '')
  const [receiverName, setReceiverName] = useState(current?.receiverName ?? '')
  const placeholder = TYPES.find((t) => t.value === pixKeyType)?.placeholder

  const save = useMutation({
    mutationFn: (clear: boolean) =>
      housePaymentService.update(
        clear
          ? { houseId, pixKey: '' }
          : { houseId, pixKey: pixKey.trim(), pixKeyType, receiverName: receiverName.trim() },
      ),
    onSuccess: (res, clear) => {
      onSaved(res.paymentInfo)
      toast.success(clear ? 'Chave PIX removida' : 'Chave PIX salva')
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Não foi possível salvar a chave PIX')),
  })

  return (
    <form
      className="space-y-4 rounded-xl border bg-card p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (!pixKey.trim()) {
          toast.error('Informe a chave PIX')
          return
        }
        save.mutate(false)
      }}
    >
      <h2 className="text-sm font-semibold">{current ? 'Trocar a chave' : 'Cadastrar chave'}</h2>
      <div className="space-y-1.5">
        <Label htmlFor="pix-type">Tipo da chave</Label>
        <select
          id="pix-type"
          value={pixKeyType}
          onChange={(e) => setPixKeyType(e.target.value as PixKeyType)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pix-key">Chave</Label>
        <Input id="pix-key" value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder={placeholder} maxLength={140} autoComplete="off" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pix-name">Nome de quem recebe (opcional)</Label>
        <Input id="pix-name" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Como aparece no app do banco" maxLength={120} />
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {current && (
          <Button type="button" variant="ghost" disabled={save.isPending} onClick={() => save.mutate(true)}>
            <Trash2 className="size-4" /> Remover chave
          </Button>
        )}
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? 'Salvando…' : 'Salvar chave'}
        </Button>
      </div>
    </form>
  )
}

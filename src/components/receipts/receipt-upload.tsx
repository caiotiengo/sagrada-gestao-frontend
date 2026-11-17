'use client'

import { useId, useRef, useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useSubmitReceipt } from '@/hooks/use-receipts'
import { prepareReceiptFile, ReceiptFileError, RECEIPT_ACCEPT } from '@/lib/receipt-file'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ReceiptView } from '@/types/receipts'
import { centsToBRL, isSettled, receiptResultText, ReceiptStatusBadge } from './receipt-parts'

/**
 * "Enviar comprovante": foto, print ou PDF do PIX. No celular o seletor
 * oferece a câmera. O resultado aparece aqui mesmo, na hora.
 */
export function ReceiptUpload({ className }: { className?: string }) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const submit = useSubmitReceipt()
  const [preparing, setPreparing] = useState(false)
  const [result, setResult] = useState<ReceiptView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const busy = preparing || submit.isPending

  const onFile = async (file: File | undefined) => {
    if (!file || !houseId) return
    setError(null)
    setResult(null)
    setPreparing(true)
    try {
      const prepared = await prepareReceiptFile(file)
      setPreparing(false)
      const receipt = await submit.mutateAsync({
        houseId,
        fileBase64: prepared.base64,
        contentType: prepared.contentType,
        fileName: prepared.fileName.slice(0, 200),
        origin: 'web',
      })
      setResult(receipt)
    } catch (err) {
      setError(err instanceof ReceiptFileError ? err.message : getErrorMessage(err, 'Não foi possível enviar o comprovante. Tente de novo.'))
    } finally {
      setPreparing(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={RECEIPT_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        data-testid="receipt-input"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <Button type="button" onClick={() => inputRef.current?.click()} disabled={busy || !houseId} data-testid="receipt-send">
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
        {preparing ? 'Preparando…' : submit.isPending ? 'Enviando…' : 'Enviar comprovante'}
      </Button>
      <p className="text-xs text-muted-foreground">Foto, print da tela do banco ou PDF, até 5 MB.</p>

      <div aria-live="polite" role="status">
        {result && (
          <div
            data-testid="receipt-result"
            data-status={result.status}
            className={cn(
              'rounded-lg border p-3 text-sm',
              isSettled(result.status)
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100'
                : result.status === 'rejected'
                  ? 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100'
                  : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100',
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <ReceiptStatusBadge status={result.status} />
              {result.amountCents != null && <span className="font-semibold tabular-nums">{centsToBRL(result.amountCents)}</span>}
            </div>
            <p className="mt-1.5 font-medium">{receiptResultText(result)}</p>
            {isSettled(result.status) && result.leftoverCents > 0 && (
              <p className="mt-1">Sobrou {centsToBRL(result.leftoverCents)}. A Liderança vai combinar com você o que fazer.</p>
            )}
            {result.status === 'pending_review' && (
              <p className="mt-1">Você recebe um aviso quando a Liderança conferir.</p>
            )}
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100" data-testid="receipt-error">
          {error}
        </p>
      )}
    </div>
  )
}

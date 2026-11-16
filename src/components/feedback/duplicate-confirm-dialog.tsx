'use client'

import { formatCurrency } from '@/utils'
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

interface DuplicateConfirmDialogProps {
  open: boolean
  onClose: () => void
  /** Sem onConfirm o diálogo só informa (o back não aceita forçar o registro). */
  onConfirm?: () => void
  isPending?: boolean
  donorName?: string
  amount?: number
  description?: string
}

export function DuplicateConfirmDialog({
  open,
  onClose,
  onConfirm,
  isPending,
  donorName,
  amount,
  description,
}: DuplicateConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Registro duplicado</AlertDialogTitle>
          <AlertDialogDescription>
            Já existe um registro recente de <strong>{donorName}</strong>
            {amount ? ` no valor de ${formatCurrency(amount)}` : ''}
            {description ? ` (${description})` : ''}.
            <br /><br />
            {onConfirm
              ? 'Deseja registrar novamente mesmo assim?'
              : 'Ele já foi recebido, não é preciso enviar de novo. Se quiser outro registro, aguarde alguns minutos.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {onConfirm ? (
            <>
              <AlertDialogCancel onClick={onClose}>
                Não, cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={onConfirm} disabled={isPending}>
                {isPending ? 'Enviando...' : 'Sim, registrar'}
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction onClick={onClose}>Entendi</AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

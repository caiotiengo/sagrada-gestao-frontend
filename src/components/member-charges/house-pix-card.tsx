'use client'

import { useQuery } from '@tanstack/react-query'
import { Copy, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import { housePaymentService } from '@/services/house-payment'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const TYPE_LABEL: Record<string, string> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  phone: 'Telefone',
  email: 'E-mail',
  random: 'Chave aleatória',
}

/**
 * Como pagar o que está em aberto: chave PIX da casa (Gestão › Chave PIX).
 * O sistema não processa o pagamento: o filho paga e a liderança dá baixa.
 */
export function HousePixCard() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const info = useQuery({
    queryKey: ['house', houseId, 'paymentInfo'],
    queryFn: () => housePaymentService.getPaymentInfo(houseId!),
    enabled: !!houseId,
  })

  if (info.isLoading || info.isError) return null
  const pix = info.data

  return (
    <Card className="mb-8" data-testid="house-pix-card">
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Como pagar</p>
        {pix ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                Chave PIX ({TYPE_LABEL[pix.pixKeyType] ?? pix.pixKeyType})
                {pix.receiverName ? ` · ${pix.receiverName}` : ''}
              </p>
              <p className="break-all text-base font-semibold">{pix.pixKey}</p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(pix.pixKey)
                toast.success('Chave PIX copiada')
              }}
            >
              <Copy className="size-4" />
              Copiar
            </Button>
          </div>
        ) : (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="size-4 shrink-0" />
            A casa ainda não cadastrou uma chave PIX. Combine o pagamento com a liderança.
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Pague direto para a casa (mensalidades, loja, rifas e o resto) e avise a liderança: depois da baixa, o item sai da lista.
        </p>
      </CardContent>
    </Card>
  )
}

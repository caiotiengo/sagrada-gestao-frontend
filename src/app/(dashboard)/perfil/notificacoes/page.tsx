'use client'

import { useEffect, useState } from 'react'
import { BellOff, BellRing, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/use-notifications'
import type { NotificationCategory } from '@/services/notifications'
import { browserPermission, enableWebPush, isWebPushEnabledHere, webPushStatus, type WebPushStatus } from '@/lib/web-push'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/feedback/error-state'

const CATEGORIES: { key: NotificationCategory; label: string; hint: string }[] = [
  { key: 'notices', label: 'Avisos da liderança', hint: 'Aviso novo, fixado ou não' },
  { key: 'events', label: 'Agenda', hint: 'Gira ou evento criado, alterado ou cancelado' },
  { key: 'payments', label: 'Mensalidade', hint: 'Vencendo amanhã e em atraso' },
  { key: 'store', label: 'Cantina', hint: 'Seu pedido ficou pronto' },
  { key: 'charges', label: 'Cobranças entre filhos', hint: 'Recebida, aceita, recusada ou paga' },
  { key: 'general', label: 'Mensagens da casa', hint: 'Recados enviados pela liderança' },
]

export default function NotificationSettingsPage() {
  const prefs = useNotificationPreferences()
  const update = useUpdateNotificationPreferences()
  const [status, setStatus] = useState<WebPushStatus | null>(null)
  const [enabledHere, setEnabledHere] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void webPushStatus().then((s) => {
      setStatus(s)
      setEnabledHere(isWebPushEnabledHere())
    })
    // Já autorizado antes: renova o token em silêncio.
    void enableWebPush({ silent: true }).then((r) => r.ok && setEnabledHere(true))
  }, [])

  const onEnable = async () => {
    setBusy(true)
    const r = await enableWebPush()
    setBusy(false)
    if (r.ok) {
      setEnabledHere(true)
      toast.success('Notificações ativadas neste navegador')
    } else if (r.message) {
      toast.error(r.message)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Notificações</h1>
        <p className="text-sm text-muted-foreground">Escolha o que chega no celular e no navegador.</p>
      </div>

      <section className="rounded-xl border bg-card p-4 sm:p-5" data-testid="web-push-card">
        {status === null ? (
          <Skeleton className="h-10 w-full" />
        ) : !status.available ? (
          <div className="flex items-start gap-3 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">Notificações no navegador desativadas</p>
              <p className="text-muted-foreground" data-testid="web-push-reason">{status.reason} No celular, ative pelo app.</p>
            </div>
          </div>
        ) : enabledHere ? (
          <div className="flex items-center gap-3 text-sm">
            <BellRing className="size-4 text-emerald-600" />
            <p>Este navegador está recebendo notificações.</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <BellOff className="size-4 text-amber-600" />
            <p className="flex-1">
              {browserPermission() === 'denied'
                ? 'Você bloqueou as notificações deste site. Libere nas configurações do navegador.'
                : 'Receba avisos da casa também neste navegador.'}
            </p>
            {browserPermission() !== 'denied' && (
              <Button size="sm" onClick={onEnable} disabled={busy}>
                Ativar no navegador
              </Button>
            )}
          </div>
        )}
      </section>

      {prefs.isError ? (
        <ErrorState message="Não foi possível carregar suas preferências." onRetry={() => prefs.refetch()} />
      ) : (
        <section className="rounded-xl border bg-card">
          <h2 className="border-b px-4 py-3 text-sm font-semibold sm:px-5">Receber alertas de</h2>
          <ul className="divide-y">
            {CATEGORIES.map((c) => (
              <li key={c.key} className="flex items-center gap-4 px-4 py-3 sm:px-5">
                <label htmlFor={`pref-${c.key}`} className="min-w-0 flex-1 cursor-pointer">
                  <span className="block text-sm font-medium">{c.label}</span>
                  <span className="block text-xs text-muted-foreground">{c.hint}</span>
                </label>
                {prefs.isLoading ? (
                  <Skeleton className="h-5 w-8" />
                ) : (
                  <Switch
                    id={`pref-${c.key}`}
                    data-testid={`pref-${c.key}`}
                    checked={prefs.data?.[c.key] ?? true}
                    onCheckedChange={(v) => update.mutate({ [c.key]: v })}
                    aria-label={c.label}
                  />
                )}
              </li>
            ))}
          </ul>
          <p className="border-t px-4 py-3 text-xs text-muted-foreground sm:px-5">
            Desligar só tira o alerta do celular e do navegador: tudo continua no sino de notificações.
          </p>
        </section>
      )}
    </div>
  )
}

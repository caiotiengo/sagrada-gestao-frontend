'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/forms/password-input'
import { useDeleteMyAccount } from '@/hooks/use-auth'
import { DELETE_ACCOUNT_CONFIRMATION } from '@/services/account'
import { getErrorCode, getErrorMessage } from '@/lib/errors'
import { ROUTES } from '@/constants'

function deleteErrorMessage(error: unknown): string {
  const code = getErrorCode(error)
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
    return 'Senha incorreta.'
  }
  return getErrorMessage(error, 'Não foi possível excluir a conta. Tente de novo.')
}

/** O que sai e o que fica: o mesmo texto da página pública /excluir-conta. */
export function DeleteAccountExplanation({ mutedClassName = 'text-muted-foreground' }: { mutedClassName?: string }) {
  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="font-medium">O que é apagado</p>
        <ul className={`mt-1 list-disc space-y-0.5 pl-5 ${mutedClassName}`}>
          <li>Seu acesso (login) e o acesso a todas as casas</li>
          <li>Nome, e-mail, telefones, CPF/RG e foto</li>
          <li>Tipo sanguíneo, contato de emergência e demais dados do perfil de médium</li>
          <li>Suas notas pessoais, notificações, aparelhos cadastrados para push e preferências</li>
        </ul>
      </div>
      <div>
        <p className="font-medium">O que fica com a casa</p>
        <ul className={`mt-1 list-disc space-y-0.5 pl-5 ${mutedClassName}`}>
          <li>
            Mensalidades, pagamentos, dívidas, compras e lançamentos do financeiro: a casa precisa deles para a
            contabilidade. Eles passam a aparecer como &ldquo;Membro excluído&rdquo;.
          </li>
          <li>Dívidas em aberto não impedem a exclusão, mas continuam registradas na casa.</li>
        </ul>
      </div>
      <p className={mutedClassName}>
        Se você é a única pessoa na administração de uma casa que tem outros membros ativos, transfira a administração
        antes. Se você é a única pessoa da casa, a casa é desativada junto.
      </p>
    </div>
  )
}

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const del = useDeleteMyAccount()
  const ids = { pwd: useId(), confirm: useId(), err: useId(), hint: useId() }

  const ready = password.length > 0 && confirm === DELETE_ACCOUNT_CONFIRMATION
  const error = del.isError ? deleteErrorMessage(del.error) : null
  const wrongPassword = error === 'Senha incorreta.'

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready || del.isPending) return
    del.mutate(password)
  }

  return (
    <section
      aria-labelledby="excluir-conta-titulo"
      className="rounded-xl border border-destructive/30 bg-card p-4 sm:p-5"
      data-testid="delete-account-section"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
        <div className="flex-1 space-y-1">
          <h2 id="excluir-conta-titulo" className="text-base font-semibold">Excluir minha conta</h2>
          <p className="text-sm text-muted-foreground">
            Apaga seus dados pessoais de forma definitiva. Não dá para desfazer.{' '}
            <Link href={ROUTES.PRIVACY} className="font-medium text-primary underline-offset-4 hover:underline">
              Política de privacidade
            </Link>
          </p>
        </div>
      </div>

      {!open ? (
        <Button
          type="button"
          variant="destructive"
          className="mt-4"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-controls="excluir-conta-form"
        >
          <Trash2 className="size-4" aria-hidden />
          Excluir minha conta
        </Button>
      ) : (
        <form id="excluir-conta-form" onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
          <DeleteAccountExplanation />

          <div className="space-y-1.5">
            <Label htmlFor={ids.pwd}>Sua senha</Label>
            <PasswordInput
              id={ids.pwd}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={wrongPassword || undefined}
              aria-describedby={wrongPassword ? ids.err : undefined}
              data-testid="delete-account-password"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={ids.confirm}>
              Digite <span className="font-mono font-semibold">{DELETE_ACCOUNT_CONFIRMATION}</span> para confirmar
            </Label>
            <Input
              id={ids.confirm}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-describedby={ids.hint}
              data-testid="delete-account-confirm"
            />
            <p id={ids.hint} className="text-xs text-muted-foreground">
              Em letras maiúsculas, sem espaços.
            </p>
          </div>

          {error && (
            <p id={ids.err} role="alert" className="text-sm text-destructive" data-testid="delete-account-error">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              variant="destructive"
              disabled={!ready || del.isPending}
              aria-disabled={!ready || del.isPending}
              data-testid="delete-account-submit"
            >
              {del.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
              {del.isPending ? 'Excluindo...' : 'Excluir definitivamente'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={del.isPending}
              onClick={() => {
                setOpen(false)
                setPassword('')
                setConfirm('')
                del.reset()
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}

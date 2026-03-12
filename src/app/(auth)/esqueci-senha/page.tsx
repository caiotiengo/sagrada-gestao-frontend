'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from 'lucide-react'

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/schemas/auth'
import { useForgotPassword } from '@/hooks/use-auth'
import { ROUTES } from '@/constants'
import { AuthLayout } from '@/components/layout/auth-layout'
import { FormField } from '@/components/forms/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  function onSubmit(data: ForgotPasswordFormData) {
    forgotPassword(data)
  }

  return (
    <AuthLayout>
      <div className="space-y-1.5 text-center">
        <h2 className="text-lg font-semibold tracking-tight">
          Recuperar senha
        </h2>
        <p className="text-sm text-muted-foreground">
          {isSuccess
            ? 'Verifique sua caixa de entrada para redefinir sua senha.'
            : 'Informe seu email e enviaremos um link de recuperação.'}
        </p>
      </div>

      {!isSuccess && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField label="Email" name="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              {...register('email')}
            />
          </FormField>

          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="w-full"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? 'Enviando...' : 'Enviar link de recuperação'}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link
          href={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Voltar ao login
        </Link>
      </div>
    </AuthLayout>
  )
}

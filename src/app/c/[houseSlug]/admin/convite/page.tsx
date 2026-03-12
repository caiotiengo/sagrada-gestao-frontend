'use client'

import { useSearchParams, useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

import {
  adminInviteRegistrationSchema,
  type AdminInviteRegistrationFormData,
} from '@/schemas/member'
import { useValidateInvite, useRegisterByInvite } from '@/hooks/use-invites'
import { ROUTES } from '@/constants'
import { PublicLayout } from '@/components/layout/public-layout'
import { InviteValidationCard } from '@/components/cards/invite-validation-card'
import { FormField } from '@/components/forms/form-field'
import { MaskedInput } from '@/components/forms/masked-input'
import { PasswordInput } from '@/components/forms/password-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminInviteRegistrationPage() {
  const params = useParams<{ houseSlug: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('invite') ?? ''

  const {
    data: invite,
    isLoading: isValidating,
    isError: isInvalidInvite,
  } = useValidateInvite(token, params.houseSlug)

  const { mutate: registerByInvite, isPending } = useRegisterByInvite()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminInviteRegistrationFormData>({
    resolver: zodResolver(adminInviteRegistrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  })

  function onSubmit(data: AdminInviteRegistrationFormData) {
    registerByInvite(
      { ...data, token, houseSlug: params.houseSlug },
      {
        onSuccess: () => {
          router.push(ROUTES.LOGIN)
        },
      },
    )
  }

  // Validando convite ou convite invalido
  if (isValidating || isInvalidInvite || !invite) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
          <InviteValidationCard
            isLoading={isValidating}
            isError={isInvalidInvite}
            data={invite}
          />
          {isInvalidInvite && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link
                href={ROUTES.LOGIN}
                className="font-medium text-primary hover:underline"
              >
                Ir para login
              </Link>
            </p>
          )}
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout houseName={invite.houseName}>
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
        <InviteValidationCard
          isLoading={false}
          isError={false}
          data={invite}
        />

        <Card className="mt-6 rounded-xl shadow-sm">
          <CardContent className="py-6">
            <div className="mb-6 space-y-1.5 text-center">
              <h2 className="text-lg font-semibold tracking-tight">
                Cadastro de Administrador
              </h2>
              <p className="text-sm text-muted-foreground">
                Preencha seus dados para completar o cadastro
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                label="Nome completo"
                name="fullName"
                error={errors.fullName}
              >
                <Input
                  id="fullName"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  {...register('fullName')}
                />
              </FormField>

              <FormField label="Email" name="email" error={errors.email}>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  {...register('email')}
                />
              </FormField>

              <FormField label="Telefone" name="phone" error={errors.phone}>
                <MaskedInput
                  id="phone"
                  mask="phone"
                  placeholder="(00) 00000-0000"
                  {...register('phone')}
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="Senha"
                  name="password"
                  error={errors.password}
                >
                  <PasswordInput
                    id="password"
                    placeholder="Min. 8 caracteres"
                    autoComplete="new-password"
                    {...register('password')}
                  />
                </FormField>

                <FormField
                  label="Confirmar senha"
                  name="confirmPassword"
                  error={errors.confirmPassword}
                >
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                  />
                </FormField>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="w-full"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Ja possui conta?{' '}
              <Link
                href={ROUTES.LOGIN}
                className="font-medium text-primary hover:underline"
              >
                Fazer login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}

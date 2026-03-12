'use client'

import { useSearchParams, useRouter, useParams } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

import {
  memberRegistrationSchema,
  type MemberRegistrationFormData,
} from '@/schemas/member'
import { useValidateInvite, useRegisterByInvite } from '@/hooks/use-invites'
import type { RegisterByInviteRequest } from '@/types'
import { BLOOD_TYPES, ROUTES } from '@/constants'
import { PublicLayout } from '@/components/layout/public-layout'
import { InviteValidationCard } from '@/components/cards/invite-validation-card'
import { FormField } from '@/components/forms/form-field'
import { MaskedInput } from '@/components/forms/masked-input'
import { PasswordInput } from '@/components/forms/password-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function MemberRegistrationPage() {
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
    control,
    formState: { errors },
  } = useForm<MemberRegistrationFormData>({
    resolver: zodResolver(memberRegistrationSchema),
    defaultValues: {
      fullName: '',
      cpf: '',
      rg: '',
      bloodType: '',
      phone: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  function onSubmit(data: MemberRegistrationFormData) {
    const { confirmPassword, bloodType, ...rest } = data
    registerByInvite(
      {
        ...rest,
        bloodType: (bloodType || undefined) as RegisterByInviteRequest['bloodType'],
        token,
        houseSlug: params.houseSlug,
      },
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
                Cadastro de Membro
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="CPF" name="cpf" error={errors.cpf}>
                  <MaskedInput
                    id="cpf"
                    mask="cpf"
                    placeholder="000.000.000-00"
                    {...register('cpf')}
                  />
                </FormField>

                <FormField label="RG" name="rg" error={errors.rg}>
                  <Input
                    id="rg"
                    placeholder="Seu RG"
                    {...register('rg')}
                  />
                </FormField>
              </div>

              <FormField
                label="Tipo sanguineo"
                name="bloodType"
                error={errors.bloodType}
              >
                <Controller
                  name="bloodType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="bloodType" className="w-full">
                        <SelectValue placeholder="Selecione (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
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
                  label="Contato de emergencia"
                  name="emergencyContactName"
                  error={errors.emergencyContactName}
                >
                  <Input
                    id="emergencyContactName"
                    placeholder="Nome do contato"
                    {...register('emergencyContactName')}
                  />
                </FormField>

                <FormField
                  label="Telefone de emergencia"
                  name="emergencyContactPhone"
                  error={errors.emergencyContactPhone}
                >
                  <MaskedInput
                    id="emergencyContactPhone"
                    mask="phone"
                    placeholder="(00) 00000-0000"
                    {...register('emergencyContactPhone')}
                  />
                </FormField>
              </div>

              <FormField label="Email" name="email" error={errors.email}>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  {...register('email')}
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

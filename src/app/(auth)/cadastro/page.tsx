'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Loader2, Shield, Users, CalendarDays, BarChart3 } from 'lucide-react'

import {
  adminRegistrationSchema,
  type AdminRegistrationFormData,
} from '@/schemas/auth'
import { useRegisterAdmin } from '@/hooks/use-auth'
import { ROUTES, DAYS_OF_WEEK, DOCUMENT_TYPES } from '@/constants'
import { cn } from '@/lib/utils'
import { AuthCard, AuthHeadline, AuthPromoPanel, authBtnGold, authBtnOutline, authLink } from '@/components/landing/auth-brand'
import { FormField } from '@/components/forms/form-field'
import { MaskedInput } from '@/components/forms/masked-input'
import { PasswordInput } from '@/components/forms/password-input'
import { PhoneArrayField } from '@/components/forms/phone-array-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LegalConsentNote } from '@/components/legal/legal-consent'

const DAY_SHORT_LABELS: Record<string, string> = {
  'Segunda-feira': 'Seg',
  'Terça-feira': 'Ter',
  'Quarta-feira': 'Qua',
  'Quinta-feira': 'Qui',
  'Sexta-feira': 'Sex',
  'Sábado': 'Sáb',
  'Domingo': 'Dom',
}

const features = [
  { icon: Users, title: 'Gestão de Membros', description: 'Cadastro, permissões e acompanhamento de todos os filhos de santo.' },
  { icon: BarChart3, title: 'Controle Financeiro', description: 'Mensalidades, pagamentos, dívidas e relatórios em um só lugar.' },
  { icon: CalendarDays, title: 'Calendário e Check-ins', description: 'Organize eventos, sessões e registre a presença dos membros.' },
  { icon: Shield, title: 'Rifas, Vendas e Listas', description: 'Crie rifas, gerencie vendas da loja e organize listas de arrecadação.' },
]

const rotatingWords = ['sua casa', 'seu templo', 'seu terreiro', 'seu barracão', 'seu ilê']

const STEP_1_FIELDS = [
  'fullName',
  'email',
  'password',
  'confirmPassword',
  'phone',
  'alternatePhone',
  'documentType',
  'documentNumber',
] as const

export default function AdminRegistrationPage() {
  const [step, setStep] = useState(1)
  const [wordIndex, setWordIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const { mutate: registerAdmin, isPending } = useRegisterAdmin()

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % rotatingWords.length)
        setIsVisible(true)
      }, 300)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const {
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    formState: { errors },
  } = useForm<AdminRegistrationFormData>({
    resolver: zodResolver(adminRegistrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      alternatePhone: '',
      documentType: 'CPF',
      documentNumber: '',
      houseName: '',
      houseDisplayName: '',
      houseAddress: '',
      houseDaysOfGira: [],
      houseContactNumbers: [{ value: '' }],
    },
  })

  const documentType = watch('documentType')

  async function handleNextStep() {
    const isValid = await trigger(STEP_1_FIELDS as unknown as (keyof AdminRegistrationFormData)[])
    if (isValid) setStep(2)
  }

  function onSubmit(data: AdminRegistrationFormData) {
    const { confirmPassword: _, houseContactNumbers, ...rest } = data
    registerAdmin({
      ...rest,
      houseContactNumbers: houseContactNumbers.map((item) => item.value),
    })
  }

  return (
    <div className="flex flex-1">
      {/* Esquerda — apresentação (só desktop) */}
      <AuthPromoPanel word={rotatingWords[wordIndex]} visible={isVisible} features={features} />

      {/* Direita — formulário */}
      <div className="flex w-full flex-col items-center justify-center px-4 pt-4 pb-12 sm:px-6 lg:w-1/2 lg:py-8">
        {/* Título no celular (escondido no desktop) */}
        <AuthHeadline
          word={rotatingWords[wordIndex]}
          visible={isVisible}
          className="mb-8 max-w-sm text-center text-[2rem] lg:hidden"
        />

        <div className="w-full max-w-lg">
          <AuthCard>

      <div className="space-y-1.5 text-center">
        <h2 className="font-display text-2xl font-semibold">
          Cadastre sua casa
        </h2>
        <p className="text-sm text-sg-muted">
          {step === 1 ? 'Dados pessoais' : 'Dados da casa'}
        </p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div
            className={`h-1.5 w-12 rounded-full transition-colors ${
              step >= 1 ? 'bg-sg-gold' : 'bg-sg-alt'
            }`}
          />
          <div
            className={`h-1.5 w-12 rounded-full transition-colors ${
              step >= 2 ? 'bg-sg-gold' : 'bg-sg-alt'
            }`}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (validationErrors) => {
        // Se houver erros no step 1 enquanto no step 2, volta ao step 1
        const step1HasError = STEP_1_FIELDS.some((f) => f in validationErrors)
        if (step === 2 && step1HasError) {
          setStep(1)
        }
        console.error('Validation errors:', validationErrors)
      })} className="mt-6 space-y-4">
        {/* ===== Step 1: Personal Data ===== */}
        {step === 1 && (
          <>
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Telefone" name="phone" error={errors.phone}>
                <MaskedInput
                  id="phone"
                  mask="phone"
                  placeholder="(00) 00000-0000"
                  {...register('phone')}
                />
              </FormField>

              <FormField
                label="Telefone alternativo"
                name="alternatePhone"
                error={errors.alternatePhone}
              >
                <MaskedInput
                  id="alternatePhone"
                  mask="phone"
                  placeholder="(00) 00000-0000"
                  {...register('alternatePhone')}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Tipo de documento"
                name="documentType"
                error={errors.documentType}
              >
                <Controller
                  name="documentType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={DOCUMENT_TYPES as ReadonlyArray<{ value: string; label: string }>}
                    >
                      <SelectTrigger id="documentType" className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField
                label="Documento"
                name="documentNumber"
                error={errors.documentNumber}
              >
                <MaskedInput
                  id="documentNumber"
                  mask={documentType === 'CNPJ' ? 'cnpj' : 'cpf'}
                  placeholder={
                    documentType === 'CNPJ'
                      ? '00.000.000/0000-00'
                      : '000.000.000-00'
                  }
                  {...register('documentNumber')}
                />
              </FormField>
            </div>

            <Button
              type="button"
              size="lg"
              className={cn('w-full', authBtnGold)}
              onClick={handleNextStep}
            >
              Continuar
              <ArrowRight className="size-4" />
            </Button>
          </>
        )}

        {/* ===== Step 2: House Data ===== */}
        {step === 2 && (
          <>
            <FormField
              label="Nome da casa"
              name="houseName"
              error={errors.houseName}
            >
              <Input
                id="houseName"
                placeholder="Nome oficial da casa"
                {...register('houseName')}
              />
            </FormField>

            <FormField
              label="Nome de exibição"
              name="houseDisplayName"
              error={errors.houseDisplayName}
              description="Nome que aparecerá para visitantes"
            >
              <Input
                id="houseDisplayName"
                placeholder="Nome de exibição"
                {...register('houseDisplayName')}
              />
            </FormField>

            <FormField
              label="Endereço"
              name="houseAddress"
              error={errors.houseAddress}
            >
              <Input
                id="houseAddress"
                placeholder="Endereço completo da casa"
                {...register('houseAddress')}
              />
            </FormField>

            {/* Days of Session */}
            <div className="space-y-2">
              <Label>Dias de sessão</Label>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-4">
                <Controller
                  name="houseDaysOfGira"
                  control={control}
                  render={({ field }) => (
                    <>
                      {DAYS_OF_WEEK.map((day) => {
                        const isChecked = field.value.includes(day)
                        return (
                          <label
                            key={day}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 px-2 py-2 text-sm transition-colors hover:bg-muted has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, day])
                                } else {
                                  field.onChange(
                                    field.value.filter((d: string) => d !== day)
                                  )
                                }
                              }}
                            />
                            <span className="leading-none">{DAY_SHORT_LABELS[day] || day}</span>
                          </label>
                        )
                      })}
                    </>
                  )}
                />
              </div>
              {errors.houseDaysOfGira && (
                <p className="text-xs text-destructive">
                  {errors.houseDaysOfGira.message}
                </p>
              )}
            </div>

            {/* Contact Numbers */}
            <PhoneArrayField
              control={control}
              name="houseContactNumbers"
              errors={errors}
              label="Telefones de contato da casa"
            />
            {errors.houseContactNumbers && !Array.isArray(errors.houseContactNumbers) && (
              <p className="-mt-2 text-xs text-destructive">
                {errors.houseContactNumbers.message}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className={cn('flex-1', authBtnOutline)}
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="size-4" />
                Voltar
              </Button>

              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className={cn('flex-1', authBtnGold)}
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </div>
          </>
        )}
      </form>
      <LegalConsentNote />

      <p className="mt-6 text-center text-sm text-sg-muted">
        Já possui conta?{' '}
        <Link
          href={ROUTES.LOGIN}
          className={authLink}
        >
          Fazer login
        </Link>
      </p>

          </AuthCard>
        </div>
      </div>
    </div>
  )
}

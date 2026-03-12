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
import { ROUTES, DAYS_OF_WEEK, DOCUMENT_TYPES, APP_NAME } from '@/constants'
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
    <div className="flex min-h-dvh">
      {/* Left — Promo panel (hidden on mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between">
        {/* Background decoration */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 size-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -right-32 -bottom-32 size-[30rem] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/3 blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-primary-foreground">
                  <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-primary-foreground">{APP_NAME}</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl leading-tight font-bold tracking-tight text-primary-foreground xl:text-4xl">
            Tudo que{' '}
            <span
              className="inline-block transition-all duration-300 ease-in-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
              }}
            >
              {rotatingWords[wordIndex]}
            </span>
            <br />
            precisa em um só lugar.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-primary-foreground/70">
            O sistema completo para gestão de casas de santo. Organize membros, finanças, eventos e muito mais.
          </p>

          {/* Features grid */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl bg-white/8 p-4 backdrop-blur-sm">
                <feature.icon className="mb-2 size-5 text-primary-foreground/80" />
                <h3 className="text-sm font-medium text-primary-foreground">{feature.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-primary-foreground/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 px-12 pb-8 xl:px-16">
          <p className="text-xs text-primary-foreground/40">
            &copy; {new Date().getFullYear()} Saravá Tech. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right — Registration form */}
      <div className="relative flex w-full flex-col items-center justify-center px-4 py-8 sm:px-6 lg:w-1/2">
        {/* Subtle background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 size-[28rem] rounded-full bg-primary/4 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 size-[28rem] rounded-full bg-accent/8 blur-3xl" />
        </div>

        {/* Mobile logo */}
        <div className="relative z-10 mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
              <path d="M12 2L2 7l10 5 10-5-10-5Z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{APP_NAME}</h1>
          <p className="text-sm text-muted-foreground">
            Tudo que{' '}
            <span
              className="inline-block font-medium text-foreground transition-all duration-300 ease-in-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(4px)',
              }}
            >
              {rotatingWords[wordIndex]}
            </span>
            {' '}precisa em um só lugar.
          </p>
        </div>

        {/* Form card */}
        <div className="relative z-10 w-full max-w-lg">
          <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">

      <div className="space-y-1.5 text-center">
        <h2 className="text-lg font-semibold tracking-tight">
          Cadastro de Administrador
        </h2>
        <p className="text-sm text-muted-foreground">
          {step === 1 ? 'Dados pessoais' : 'Dados da casa'}
        </p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div
            className={`h-1.5 w-12 rounded-full transition-colors ${
              step >= 1 ? 'bg-primary' : 'bg-muted'
            }`}
          />
          <div
            className={`h-1.5 w-12 rounded-full transition-colors ${
              step >= 2 ? 'bg-primary' : 'bg-muted'
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
              className="w-full"
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
                className="flex-1"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="size-4" />
                Voltar
              </Button>

              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="flex-1"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </div>
          </>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já possui conta?{' '}
        <Link
          href={ROUTES.LOGIN}
          className="font-medium text-primary hover:underline"
        >
          Fazer login
        </Link>
      </p>

          </div>
        </div>
      </div>
    </div>
  )
}

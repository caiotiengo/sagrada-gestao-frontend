'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Shield, Users, CalendarDays, BarChart3 } from 'lucide-react'

import { loginSchema, type LoginFormData } from '@/schemas/auth'
import { useLogin } from '@/hooks/use-auth'
import { ROUTES, APP_NAME } from '@/constants'
import { FormField } from '@/components/forms/form-field'
import { PasswordInput } from '@/components/forms/password-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const features = [
  {
    icon: Users,
    title: 'Gestão de Membros',
    description: 'Cadastro, permissões e acompanhamento de todos os filhos de santo.',
  },
  {
    icon: BarChart3,
    title: 'Controle Financeiro',
    description: 'Mensalidades, pagamentos, dívidas e relatórios em um só lugar.',
  },
  {
    icon: CalendarDays,
    title: 'Calendário e Check-ins',
    description: 'Organize eventos, sessões e registre a presença dos membros.',
  },
  {
    icon: Shield,
    title: 'Rifas, Vendas e Listas',
    description: 'Crie rifas, gerencie vendas da loja e organize listas de arrecadação.',
  },
]

const rotatingWords = ['sua casa', 'seu templo', 'seu terreiro', 'seu barracão', 'seu ilê']

export default function LoginPage() {
  const [wordIndex, setWordIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

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
  const { mutate: login, isPending } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(data: LoginFormData) {
    login(data)
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5 text-primary-foreground"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-primary-foreground">
                {APP_NAME}
              </span>
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
            O sistema completo para gestão de casas de santo. Organize membros,
            finanças, eventos e muito mais.
          </p>

          {/* Features grid */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-white/8 p-4 backdrop-blur-sm"
              >
                <feature.icon className="mb-2 size-5 text-primary-foreground/80" />
                <h3 className="text-sm font-medium text-primary-foreground">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-primary-foreground/60">
                  {feature.description}
                </p>
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

      {/* Right — Login form */}
      <div className="relative flex w-full flex-col items-center justify-center px-4 py-8 sm:px-6 lg:w-1/2">
        {/* Subtle background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 size-[28rem] rounded-full bg-primary/4 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 size-[28rem] rounded-full bg-accent/8 blur-3xl" />
        </div>

        {/* Mobile logo (hidden on desktop) */}
        <div className="relative z-10 mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5Z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {APP_NAME}
          </h1>
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
        <div className="relative z-10 w-full max-w-sm">
          <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
            <div className="space-y-1.5 text-center">
              <h2 className="text-lg font-semibold tracking-tight">
                Entrar na sua conta
              </h2>
              <p className="text-sm text-muted-foreground">
                Insira seus dados para acessar o sistema
              </p>
            </div>

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

              <FormField label="Senha" name="password" error={errors.password}>
                <PasswordInput
                  id="password"
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  {...register('password')}
                />
              </FormField>

              <div className="flex justify-end">
                <Link
                  href={ROUTES.FORGOT_PASSWORD}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="w-full"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Deseja cadastrar sua casa?{' '}
              <Link
                href={ROUTES.REGISTER_ADMIN}
                className="font-medium text-primary hover:underline"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

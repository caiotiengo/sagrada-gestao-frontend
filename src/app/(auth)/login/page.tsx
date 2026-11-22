'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Shield, Users, CalendarDays, BarChart3 } from 'lucide-react'

import { loginSchema, type LoginFormData } from '@/schemas/auth'
import { useLogin, useRedirectIfAuthenticated } from '@/hooks/use-auth'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import { AuthCard, AuthHeadline, AuthPromoPanel, authBtnGold, authLink } from '@/components/landing/auth-brand'
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
  // Já logado: vai direto para a home (não mostra o formulário de novo)
  useRedirectIfAuthenticated()

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

        <div className="w-full max-w-sm">
          <AuthCard>
            <div className="space-y-1.5 text-center">
              <h2 className="font-display text-2xl font-semibold">
                Entrar na sua conta
              </h2>
              <p className="text-sm text-sg-muted">
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
                  className="text-xs text-sg-muted transition-colors hover:text-sg-fg"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className={cn('w-full', authBtnGold)}
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-sg-muted">
              Deseja cadastrar sua casa?{' '}
              <Link href={ROUTES.REGISTER_ADMIN} className={authLink}>
                Criar conta
              </Link>
            </p>
          </AuthCard>
        </div>
      </div>
    </div>
  )
}

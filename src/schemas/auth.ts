import { z } from 'zod'
import { isValidCPF, isValidCNPJ } from '@/utils'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email obrigatório').email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email obrigatório').email('Email inválido'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const adminRegistrationSchema = z
  .object({
    fullName: z.string().min(3, 'Nome completo obrigatório'),
    email: z.string().min(1, 'Email obrigatório').email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
    phone: z.string().min(14, 'Telefone inválido'),
    alternatePhone: z.string().optional(),
    documentType: z.enum(['CPF', 'CNPJ']),
    documentNumber: z.string().min(1, 'Documento obrigatório'),
    houseName: z.string().min(2, 'Nome da casa obrigatório'),
    houseDisplayName: z.string().min(2, 'Nome de exibição obrigatório'),
    houseAddress: z.string().min(5, 'Endereço obrigatório'),
    houseDaysOfGira: z.array(z.string()).min(1, 'Selecione ao menos um dia'),
    houseContactNumbers: z
      .array(z.object({ value: z.string().min(14, 'Telefone inválido') }))
      .min(1, 'Ao menos um telefone de contato'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.documentType === 'CPF') return isValidCPF(data.documentNumber)
      if (data.documentType === 'CNPJ') return isValidCNPJ(data.documentNumber)
      return false
    },
    {
      message: 'Documento inválido',
      path: ['documentNumber'],
    }
  )

export type AdminRegistrationFormData = z.infer<typeof adminRegistrationSchema>

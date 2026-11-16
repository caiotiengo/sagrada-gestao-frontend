import { z } from 'zod'
import { isValidCPF, isValidCNPJ } from '@/utils'
import { optionalPhoneField, personNameField, phoneField, plainTextField } from './fields'

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
    fullName: personNameField(),
    email: z.string().min(1, 'Email obrigatório').email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
    phone: phoneField(),
    alternatePhone: optionalPhoneField('Telefone alternativo inválido'),
    documentType: z.enum(['CPF', 'CNPJ']),
    documentNumber: z.string().min(1, 'Documento obrigatório'),
    houseName: plainTextField('Nome da casa', 3, 80),
    houseDisplayName: plainTextField('Nome de exibição', 3, 80),
    houseAddress: plainTextField('Endereço', 5, 300),
    houseDaysOfGira: z.array(z.string()).min(1, 'Selecione ao menos um dia'),
    houseContactNumbers: z
      .array(z.object({ value: phoneField() }))
      .min(1, 'Ao menos um telefone de contato')
      .max(5, 'Informe no máximo 5 telefones'),
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

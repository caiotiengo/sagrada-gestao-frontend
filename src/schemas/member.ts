import { z } from 'zod'
import { isValidCPF } from '@/utils'

export const memberRegistrationSchema = z
  .object({
    fullName: z.string().min(3, 'Nome completo obrigatório'),
    cpf: z.string().min(14, 'CPF obrigatório'),
    rg: z.string().min(1, 'RG obrigatório'),
    bloodType: z.string().optional(),
    phone: z.string().min(14, 'Telefone inválido'),
    emergencyContactName: z.string().min(2, 'Nome do contato de emergência obrigatório'),
    emergencyContactPhone: z.string().min(14, 'Telefone de emergência inválido'),
    email: z.string().min(1, 'Email obrigatório').email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine((data) => isValidCPF(data.cpf), {
    message: 'CPF inválido',
    path: ['cpf'],
  })

export type MemberRegistrationFormData = z.infer<typeof memberRegistrationSchema>

export const adminInviteRegistrationSchema = z
  .object({
    fullName: z.string().min(3, 'Nome completo obrigatório'),
    email: z.string().min(1, 'Email obrigatório').email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
    phone: z.string().min(14, 'Telefone inválido'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

export type AdminInviteRegistrationFormData = z.infer<typeof adminInviteRegistrationSchema>

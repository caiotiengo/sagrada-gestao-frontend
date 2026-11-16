import { z } from 'zod'
import { isValidCPF } from '@/utils'
import { personNameField, phoneField } from './fields'

export const memberRegistrationSchema = z
  .object({
    fullName: personNameField(),
    cpf: z.string().min(14, 'CPF obrigatório'),
    rg: z
      .string()
      .trim()
      .min(5, 'RG inválido')
      .max(20, 'RG inválido')
      .regex(/^[0-9A-Za-z.\-\s/]+$/, 'RG inválido'),
    bloodType: z.string().optional(),
    phone: phoneField(),
    emergencyContactName: personNameField('Nome do contato de emergência', 2),
    emergencyContactPhone: phoneField('Telefone de emergência inválido'),
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
    fullName: personNameField(),
    email: z.string().min(1, 'Email obrigatório').email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
    phone: phoneField(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

export type AdminInviteRegistrationFormData = z.infer<typeof adminInviteRegistrationSchema>

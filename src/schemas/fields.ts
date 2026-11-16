import { z } from 'zod'

/**
 * Campos com as mesmas regras do back (functions/src/schemas/fields.ts):
 * telefone 10–11 dígitos (aceita máscara), nome ≤120 sem < >, textos curtos
 * com limite e sem tags.
 */

const digits = (v: string) => v.replace(/\D/g, '')

export const phoneField = (message = 'Telefone inválido') =>
  z
    .string()
    .min(1, message)
    .refine((v) => [10, 11].includes(digits(v).length), message)

export const optionalPhoneField = (message = 'Telefone inválido') =>
  z
    .string()
    .optional()
    .refine((v) => !v || !digits(v) || [10, 11].includes(digits(v).length), message)

export const personNameField = (label = 'Nome completo', min = 3) =>
  z
    .string()
    .trim()
    .min(min, `${label} obrigatório`)
    .max(120, `${label} deve ter no máximo 120 caracteres`)
    .refine((v) => !/[<>]/.test(v), `${label} contém caracteres inválidos`)

export const plainTextField = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label} obrigatório`)
    .max(max, `${label} deve ter no máximo ${max} caracteres`)
    .refine((v) => !/[<>]/.test(v), `${label} contém caracteres inválidos`)

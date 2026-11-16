import { z } from 'zod'
import { personNameField, phoneField } from './fields'

/** Limites da rota pública (back fix/campaigns). */
export const MAX_PUBLIC_CONTRIBUTION = 100_000
export const MAX_PUBLIC_RAFFLE_NUMBERS = 30

export const campaignContributionSchema = z.object({
  amount: z
    .number()
    .min(1, 'Valor mínimo de R$ 1,00')
    .max(MAX_PUBLIC_CONTRIBUTION, 'Valor máximo de R$ 100.000,00'),
  donorName: personNameField('Nome', 2),
  donorPhone: phoneField('Telefone (WhatsApp) inválido'),
  donorDocument: z.string().optional(),
  donorEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  message: z.string().max(500, 'Máximo de 500 caracteres').optional(),
})

export type CampaignContributionFormData = z.infer<typeof campaignContributionSchema>

export const raffleReservationSchema = z.object({
  numbers: z
    .array(z.number())
    .min(1, 'Selecione ao menos um número')
    .max(MAX_PUBLIC_RAFFLE_NUMBERS, `Máximo de ${MAX_PUBLIC_RAFFLE_NUMBERS} números por reserva`)
    .refine((a) => new Set(a).size === a.length, 'Números repetidos na reserva'),
  buyerName: personNameField('Nome', 2),
  buyerPhone: phoneField('Telefone inválido'),
  buyerDocument: z.string().optional(),
  buyerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
})

export type RaffleReservationFormData = z.infer<typeof raffleReservationSchema>

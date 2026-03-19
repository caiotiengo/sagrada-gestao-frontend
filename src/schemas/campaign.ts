import { z } from 'zod'

export const campaignContributionSchema = z.object({
  amount: z.number().min(5, 'Valor mínimo de R$ 5,00'),
  donorName: z.string().min(2, 'Nome obrigatório'),
  donorPhone: z.string().min(14, 'Telefone (WhatsApp) obrigatório'),
  donorDocument: z.string(),
  donorEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  message: z.string().max(200, 'Máximo 200 caracteres').optional(),
})

export type CampaignContributionFormData = z.infer<typeof campaignContributionSchema>

export const raffleReservationSchema = z.object({
  numbers: z.array(z.number()).min(1, 'Selecione ao menos um número'),
  buyerName: z.string().min(2, 'Nome obrigatório'),
  buyerPhone: z.string().min(14, 'Telefone inválido'),
  buyerDocument: z.string(),
  buyerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
})

export type RaffleReservationFormData = z.infer<typeof raffleReservationSchema>

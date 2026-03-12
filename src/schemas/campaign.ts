import { z } from 'zod'

export const campaignContributionSchema = z.object({
  amount: z.number().min(1, 'Valor mínimo de R$ 1,00'),
  donorName: z.string().min(2, 'Nome obrigatório'),
  donorPhone: z.string().min(14, 'Telefone (WhatsApp) obrigatório'),
  donorEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  message: z.string().max(200, 'Máximo 200 caracteres').optional(),
})

export type CampaignContributionFormData = z.infer<typeof campaignContributionSchema>

export const raffleReservationSchema = z.object({
  numbers: z.array(z.number()).min(1, 'Selecione ao menos um número'),
  buyerName: z.string().min(2, 'Nome obrigatório'),
  buyerPhone: z.string().min(14, 'Telefone inválido'),
  buyerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
})

export type RaffleReservationFormData = z.infer<typeof raffleReservationSchema>

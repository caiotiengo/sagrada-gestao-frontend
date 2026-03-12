import { z } from 'zod'

export const createInviteSchema = z.object({
  inviteType: z.enum(['member', 'admin']),
  maxUses: z.number().min(1).optional(),
  expiresInHours: z.number().min(1).max(720).optional(),
})

export type CreateInviteFormData = z.infer<typeof createInviteSchema>

import { z } from 'zod'

export const BaseModel = z.object({
  id: z.number(),
})

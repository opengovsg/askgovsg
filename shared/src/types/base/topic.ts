import { z } from 'zod'
import { BaseModel } from './common'

export const Topic = BaseModel.extend({
  name: z.string(),
  description: z.string(),
  parentId: z.number(),
  agencyId: z.number(),
})

export type Topic = z.infer<typeof Topic>

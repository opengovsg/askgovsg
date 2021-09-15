import { z } from 'zod'
import { BaseModel } from './common'

export const Answer = BaseModel.extend({
  body: z.string(),
})

export type Answer = z.infer<typeof Answer>

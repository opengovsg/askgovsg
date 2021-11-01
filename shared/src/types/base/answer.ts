import { z } from 'zod'
import { BaseModel } from './common'

export const Answer = BaseModel.extend({
  body: z.string(),
  userId: z.number().nonnegative(),
  postId: z.number().nonnegative(),
})

export type Answer = z.infer<typeof Answer>

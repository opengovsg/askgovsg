import { z } from 'zod'
import { BaseModel } from './common'

export const User = BaseModel.extend({
  username: z.string(),
  displayname: z.string(),
  views: z.number().nonnegative(),
  agencyId: z.number(),
})

export type User = z.infer<typeof User>

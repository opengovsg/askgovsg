import { z } from 'zod'
import { BaseModel } from './common'

export const PublicUser = BaseModel.extend({
  sgid: z.string(),
  displayname: z.string(),
  email: z.string(),
  active: z.boolean(),
})

export type PublicUser = z.infer<typeof PublicUser>

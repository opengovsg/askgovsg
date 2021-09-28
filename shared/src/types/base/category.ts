import { z } from 'zod'
import { BaseModel } from './common'

export const Category = BaseModel.extend({
  catname: z.string(),
  parentId: z.string(),
  agencyId: z.number(),
})

export type Category = z.infer<typeof Category>

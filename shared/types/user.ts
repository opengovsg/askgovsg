import { z } from 'zod'

export const User = z.object({
  id: z.number(),
  username: z.string(),
  displayname: z.string(),
  views: z.number().nonnegative(),
})

export type User = z.infer<typeof User>

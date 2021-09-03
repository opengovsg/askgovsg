import { z } from 'zod'

export const UserBaseDto = z.object({
  id: z.string(),
  username: z.string(),
  displayname: z.string(),
  views: z.number().nonnegative(),
})

export type UserBaseDto = z.infer<typeof UserBaseDto>

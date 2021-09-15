import { z } from 'zod'

export enum PermissionType {
  Answerer = 'answerer',
  Admin = 'admin',
}

// no BaseModel as Permission table has no id
export const Permission = z.object({
  role: z.nativeEnum(PermissionType),
  tagId: z.number(),
  userId: z.number(),
})

export type Permission = z.infer<typeof Permission>

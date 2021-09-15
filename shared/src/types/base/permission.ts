import { z } from 'zod'
import { SequelizeTimestamps } from './common'

export enum PermissionType {
  Answerer = 'answerer',
  Admin = 'admin',
}

// Permission table has no id, so extend from
// Timestamps instead of BaseModel
export const Permission = SequelizeTimestamps.extend({
  role: z.nativeEnum(PermissionType),
  tagId: z.number(),
  userId: z.number(),
})

export type Permission = z.infer<typeof Permission>

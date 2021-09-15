import { z } from 'zod'
import { BaseModel } from './common'

export enum PermissionType {
  Answerer = 'answerer',
  Admin = 'admin',
}

// Permission table has no id
export const Permission = BaseModel.extend({
  role: z.nativeEnum(PermissionType),
  tagId: z.number(),
  userId: z.number(),
}).omit({ id: true })

export type Permission = z.infer<typeof Permission>

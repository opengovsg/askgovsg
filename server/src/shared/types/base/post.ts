import { z } from 'zod'
import { BaseModel } from './common'

export enum PostStatus {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
  Archived = 'ARCHIVED',
}

export const Post = BaseModel.extend({
  title: z.string(),
  description: z.string().nullable(),
  views: z.number().nonnegative(),
  status: z.nativeEnum(PostStatus),
})

export type Post = z.infer<typeof Post>

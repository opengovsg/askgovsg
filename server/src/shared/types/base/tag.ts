import { z } from 'zod'
import { BaseModel } from './common'

export enum TagType {
  Agency = 'AGENCY',
  Topic = 'TOPIC',
}

export const Tag = BaseModel.extend({
  tagname: z.string(),
  description: z.string(),
  link: z.string(),
  hasPilot: z.boolean(),
  tagType: z.nativeEnum(TagType),
})

export type Tag = z.infer<typeof Tag>

import { TagType } from '~shared/types/base'

import { BaseModelParams } from './common'

export type BaseTagDto = BaseModelParams & {
  description: string
  hasPilot: boolean
  link: string
  tagType: TagType
  tagname: string
  posttag: Omit<BaseModelParams, 'id'> & {
    postId: number
    tagId: number
  }
}

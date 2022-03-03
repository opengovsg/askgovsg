import { Topic } from '~shared/types/base'
import { MessageResponse } from './common'

export type GetTopicsDto = Topic & {
  children?: GetTopicsDto[]
}

export type CreateTopicReqDto = Pick<
  Topic,
  'name' | 'description' | 'parentId' | 'agencyId'
>

export type CreateTopicResDto = MessageResponse & { data: number } & Topic

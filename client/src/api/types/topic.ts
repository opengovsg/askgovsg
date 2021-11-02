import { MessageResponse } from './common'
import { Topic } from '~shared/types/base'

export type GetTopicsDto = Topic & {
  children?: GetTopicsDto[]
}

export type CreateTopicResDto = MessageResponse & { data: number }

import { Topic } from '~shared/types/base'

import { MessageResponse } from './common'

export type GetTopicsDto = Topic & {
  children?: GetTopicsDto[]
}

export type CreateTopicResDto = MessageResponse & { data: number }

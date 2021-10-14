import { Topic } from '~shared/types/base'

export type UpdateTopicRequestDto = Pick<
  Topic,
  'name' | 'description' | 'parentId'
>

import { BaseModelParams, MessageResponse } from './common'
import { BaseTagDto } from './tag'
import { User, PostStatus } from '~shared/types/base'

export type BasePostDto = BaseModelParams & {
  userId: number
  agencyId: number
  title: string
  description: string
  views: number
  status: PostStatus
  topicId: number | null
  tags: BaseTagDto[]
}

// Backend does not select updatedAt
export type GetSinglePostDto = BasePostDto & {
  tags: BaseTagDto[]
  user: Pick<User, 'displayname'>
  relatedPosts: BasePostDto[]
}

export type GetPostsDto = {
  posts: BasePostDto[]
  totalItems: number
}

export type CreatePostReqDto = Pick<
  BasePostDto,
  'title' | 'description' | 'agencyId' | 'topicId'
> & {
  tagname: string[] | null
}

export type CreatePostResDto = MessageResponse & { data: number }

export type UpdatePostReqDto = CreatePostReqDto

export type UpdatePostResDto = MessageResponse

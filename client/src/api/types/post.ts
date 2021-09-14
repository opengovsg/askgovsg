import { PostStatus } from '../../types/post-status'
import { BaseModelParams, MessageResponse } from './common'
import { BaseTagDto } from './tag'
import { User as UserBaseDto } from '~shared/types/base'

export type BasePostDto = BaseModelParams & {
  userId: number
  title: string
  description: string
  views: number
  status: PostStatus
}

// Backend does not select updatedAt
export type GetSinglePostDto = Omit<BasePostDto, 'updatedAt'> & {
  tags: BaseTagDto[]
  user: Pick<UserBaseDto, 'displayname'>
}

export type CreatePostReqDto = Pick<BasePostDto, 'title' | 'description'> & {
  tagname: string[]
}

export type CreatePostResDto = MessageResponse & { data: number }

export type UpdatePostReqDto = CreatePostReqDto

export type UpdatePostResDto = MessageResponse

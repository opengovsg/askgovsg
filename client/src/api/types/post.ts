import { PostStatus } from '../../types/post-status'
import { BaseModelParams, MessageResponse } from './common'
import { BaseTagDto } from './tag'
import { BaseUserDto } from './user'

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
  user: Pick<BaseUserDto, 'displayname'>
}

export type CreatePostReqDto = Pick<BasePostDto, 'title' | 'description'> & {
  tagname: string[]
}

export type CreatePostResDto = MessageResponse & { data: number }

export type UpdatePostReqDto = CreatePostReqDto

export type UpdatePostResDto = MessageResponse

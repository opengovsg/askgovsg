import { BaseModelParams, MessageResponse } from './common'

export type BaseAnswerDto = BaseModelParams & {
  body: string
  postId: number
}

export type GetAnswersForPostDto = (BaseAnswerDto & {
  agencyLogo: string
  userId: number
  username: string
})[]

export type CreateAnswerReqDto = { text: string }

// Returns answer ID
export type CreateAnswerResDto = MessageResponse & { data: number }

export type UpdateAnswerReqDto = CreateAnswerReqDto

// Returns number of rows changed in database
export type UpdateAnswerResDto = MessageResponse & { data: number }

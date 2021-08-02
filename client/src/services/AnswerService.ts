import {
  ApiClient,
  CreateAnswerReqDto,
  CreateAnswerResDto,
  GetAnswersForPostDto,
  UpdateAnswerReqDto,
  UpdateAnswerResDto,
} from '../api'

export const getAnswersForPost = async (
  postId: number,
): Promise<GetAnswersForPostDto | undefined> =>
  ApiClient.get<GetAnswersForPostDto | undefined>(
    `/posts/answers/${postId}`,
  ).then(({ data }) => data)
export const GET_ANSWERS_FOR_POST_QUERY_KEY = 'getAnswersForPost'

export const updateAnswer = async (
  id: number,
  update: UpdateAnswerReqDto,
): Promise<UpdateAnswerResDto> =>
  ApiClient.put<UpdateAnswerResDto>(`/posts/answers/${id}`, update).then(
    ({ data }) => data,
  )

export const createAnswer = async (
  postId: number,
  answerData: CreateAnswerReqDto,
): Promise<CreateAnswerResDto> =>
  ApiClient.post(`/posts/answers/${postId}`, answerData).then(
    ({ data }) => data,
  )

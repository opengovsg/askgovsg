import {
  ApiClient,
  CreateTopicReqDto,
  CreateTopicResDto,
  GetTopicsDto,
  UpdateTopicReqRto,
  UpdateTopicResDto,
} from '../api'
import { Topic } from '~shared/types/base'
import { AxiosResponse } from 'axios'

export const getTopicsUsedByAgency = (
  agencyId: number,
): Promise<GetTopicsDto[]> => {
  return ApiClient.get<GetTopicsDto[]>(`/agencies/${agencyId}/topics`).then(
    ({ data }) => data,
  )
}

export const GET_TOPICS_USED_BY_AGENCY_QUERY_KEY = 'getTopicsUsedByAgency'

export const getTopicById = (id: number): Promise<Topic> => {
  return ApiClient.get<Topic>(`/topics/${id}`).then(({ data }) => data)
}

export const GET_TOPIC_BY_ID_QUERY_KEY = 'getTopicById'

export const createTopic = (
  topic: CreateTopicReqDto,
): Promise<CreateTopicResDto> => {
  return ApiClient.post<CreateTopicReqDto, AxiosResponse<CreateTopicResDto>>(
    '/topics',
    topic,
  ).then(({ data }) => data)
}

export const CREATE_TOPIC_QUERY_KEY = 'createTopic' // unused in codebase

export const updateTopic = (
  topic: UpdateTopicReqRto,
): Promise<UpdateTopicResDto> => {
  return ApiClient.put<UpdateTopicReqRto, AxiosResponse<UpdateTopicResDto>>(
    `/topics/${topic.id}`,
    topic,
  ).then(({ data }) => data)
}

export const UPDATE_TOPIC_QUERY_KEY = 'updateTopic' // unused in codebase

export const deleteTopic = async (id: string): Promise<void> => {
  return ApiClient.delete(`/topics/${id}`).then(({ data }) => data)
}

export const DELETE_TOPIC_QUERY_KEY = 'deleteTopic' // unused in codebase

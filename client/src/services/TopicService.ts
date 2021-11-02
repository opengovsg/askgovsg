import { ApiClient, GetTopicsDto } from '../api'

export const fetchTopics = (): Promise<GetTopicsDto[]> =>
  ApiClient.get<GetTopicsDto[]>('/topics').then(({ data }) => data)
export const FETCH_TOPICS_QUERY_KEY = 'fetchTopics'

export const getTopicsUsedByAgency = (
  agencyId: number,
): Promise<GetTopicsDto[]> =>
  ApiClient.get<GetTopicsDto[]>(`/agencies/${agencyId}/topics`).then(
    ({ data }) => data,
  )

export const GET_TOPICS_USED_BY_AGENCY_QUERY_KEY = 'getTopicsUsedByAgency'

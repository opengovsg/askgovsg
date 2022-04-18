import { AxiosResponse } from 'axios'

import { Tag } from '~shared/types/base'

import { ApiClient } from '../api'

export const fetchTags = async (): Promise<Tag[]> =>
  ApiClient.get<never, AxiosResponse<Tag[]>>('/tags').then(({ data }) => data)
export const FETCH_TAGS_QUERY_KEY = 'fetchTags'

export const getTagsByUser = async (): Promise<Tag[]> =>
  ApiClient.get<never, AxiosResponse<Tag[]>>(`/tags/user`).then(
    ({ data }) => data,
  )
export const GET_TAGS_BY_USER_QUERY_KEY = 'getTagsByUser'

export const getTagsUsedByAgency = async (agencyId: number): Promise<Tag[]> =>
  ApiClient.get<never, AxiosResponse<Tag[]>>(`/tags/agency/${agencyId}`).then(
    ({ data }) => data,
  )
export const GET_TAGS_USED_BY_AGENCY_QUERY_KEY = 'getTagsUsedByAgency'

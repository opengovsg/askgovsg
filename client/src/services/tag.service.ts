import { ApiClient } from '../api'

// TODO: refactor into shared types between frontend and backend
export interface Tag {
  id: string
  tagname: string
  description: string
  link: string
  hasPilot: boolean
  tagType: string
}

export const fetchTags = async (): Promise<Tag[]> =>
  ApiClient.get('/tags').then((res) => res.data.data)
export const FETCH_TAGS_QUERY_KEY = 'fetchTags'

export const getTagsByUser = async (): Promise<Tag[]> =>
  ApiClient.get(`/tags/user`).then((res) => res.data)
export const GET_TAGS_BY_USER_QUERY_KEY = 'getTagsByUser'

export const getTagsUsedByAgency = async (agencyId: string): Promise<Tag[]> =>
  ApiClient.get(`/tags/agency/${agencyId}`).then((res) => res.data)
export const GET_TAGS_USED_BY_AGENCY_QUERY_KEY = 'getTagsUsedByAgency'

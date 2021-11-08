import { Agency } from '~shared/types/base'
import { ApiClient } from '../api'

export { Agency } from '~shared/types/base'

export type AgencyQuery = {
  shortname: string
}

export const getAgencyByShortName = (query: AgencyQuery): Promise<Agency> => {
  return ApiClient.get<Agency>(`/agencies/`, { params: query }).then(
    ({ data }) => data,
  )
}

export const getAgencyById = (id: number): Promise<Agency> => {
  return ApiClient.get<Agency>(`/agencies/${id}`).then(({ data }) => data)
}

export const listAgencyShortNames = (): Promise<{ shortname: string }[]> => {
  return ApiClient.get<{ shortname: string }[]>(`/agencies/shortnames`).then(
    ({ data }) => data,
  )
}

export const GET_AGENCY_BY_SHORTNAME_QUERY_KEY = 'getAgencyByShortName'
export const GET_AGENCY_BY_ID_QUERY_KEY = 'getAgencyById'
export const LIST_AGENCY_SHORTNAMES = 'listAgencyShortNames'

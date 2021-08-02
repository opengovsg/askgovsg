import { ApiClient } from '../api'

export type Agency = {
  id: string
  email: string
  shortname: string
  longname: string
  logo: string
}

export type AgencyQuery = {
  shortname: string
}

export const getAgencyByShortName = (query: AgencyQuery): Promise<Agency> => {
  return ApiClient.get(`/agencies/`, { params: query }).then(({ data }) => data)
}
export const GET_AGENCY_BY_SHORTNAME_QUERY_KEY = 'getAgencyByShortName'

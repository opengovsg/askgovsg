import { Agency } from '~shared/types/base'
import { ApiClient } from '../api'

export { Agency } from '~shared/types/base'

export type AgencyQuery = {
  shortname: string
}

export const getAgencyByShortName = (query: AgencyQuery): Promise<Agency> => {
  return ApiClient.get(`/agencies/`, { params: query }).then(({ data }) => data)
}
export const GET_AGENCY_BY_SHORTNAME_QUERY_KEY = 'getAgencyByShortName'

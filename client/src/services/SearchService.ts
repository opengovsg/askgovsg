import { SearchEntry } from '~shared/types/api'
import { ApiClient } from '../api'

const SEARCH_API_BASE = '/search'
export const SEARCH_QUERY_KEY = 'search'

export const search = async ({
  query,
  agencyId,
}: {
  query: string
  agencyId?: number
}): Promise<SearchEntry[]> => {
  return ApiClient.get<SearchEntry[]>(SEARCH_API_BASE, {
    params: { query, agencyId },
  }).then(({ data }) => data)
}

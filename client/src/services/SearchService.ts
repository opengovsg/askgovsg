import { SearchEntryWithHighlight } from '~shared/types/api'

import { ApiClient } from '../api'

const SEARCH_API_BASE = '/search'
export const SEARCH_QUERY_KEY = 'search'

export const search = async ({
  query,
  agencyId,
}: {
  query: string
  agencyId?: number
}): Promise<SearchEntryWithHighlight[]> => {
  return ApiClient.get<SearchEntryWithHighlight[]>(SEARCH_API_BASE, {
    params: { query, agencyId },
  }).then(({ data }) => data)
}

import * as reactQuery from 'react-query'

import { fetchEnvironment } from '../services/EnvService'

export const useEnvironment = (): reactQuery.UseQueryResult<
  {
    bannerMessage: string
    googleAnalyticsId: string
    fullStoryOrgId: string
  },
  unknown
> => {
  return reactQuery.useQuery<{
    bannerMessage: string
    googleAnalyticsId: string
    fullStoryOrgId: string
  }>('fetchEnvironment', fetchEnvironment, {
    staleTime: Infinity,
  })
}

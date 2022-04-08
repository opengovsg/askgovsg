import { EnvironmentDto } from '~shared/types/api'

import { ApiClient } from '../api'

export const fetchEnvironment = (): Promise<EnvironmentDto> =>
  ApiClient.get<EnvironmentDto>('/environment').then((res) => res.data)

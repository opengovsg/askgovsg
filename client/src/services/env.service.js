import { ApiClient } from '../api'

export const fetchEnvironment = () =>
  ApiClient.get('/environment').then((res) => res.data)

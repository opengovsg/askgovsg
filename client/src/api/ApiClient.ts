import axios, { AxiosError } from 'axios'

import { ErrorDto } from '~shared/types/api'

const API_BASE_URL = '/api/v1'

export const getApiErrorMessage = (error?: unknown): string => {
  const defaultErrMsg =
    'Sorry, something went wrong. Please refresh and try again.'
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<ErrorDto>).response?.data
    return data?.message ?? defaultErrMsg
  }

  return defaultErrMsg
}

export const ApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000, // 100 secs
})

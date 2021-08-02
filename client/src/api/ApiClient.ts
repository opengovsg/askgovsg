import axios from 'axios'

const API_BASE_URL = '/api/v1'

export const getApiErrorMessage = (error?: unknown): string => {
  const defaultErrMsg =
    'Sorry, something went wrong. Please refresh and try again.'
  if (axios.isAxiosError(error)) {
    return error.response?.data.message ?? defaultErrMsg
  }

  return defaultErrMsg
}

export const ApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000, // 100 secs
})

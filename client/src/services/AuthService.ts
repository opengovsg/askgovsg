import { ApiClient } from '../api'

export const sendOtp = (email: string): Promise<void> => {
  return ApiClient.post('/auth/sendotp', { email })
}

export const verifyOtp = async (data: {
  email: string
  otp: string
}): Promise<void> => {
  return ApiClient.post('/auth/verifyotp', data)
}

import { ApiClient } from '../api'

export const sendOtp = (email: string): Promise<void> => {
  return ApiClient.post('/auth/sendotp', { email })
}

export const verifyOtp = async (data: {
  email: string
  otp: string
}): Promise<{
  displayName: string
  newParticipant: boolean
  token: string
}> => {
  const {
    data: { displayname, newParticipant, token },
  } = await ApiClient.post('/auth/verifyotp', data)
  return {
    displayName: displayname,
    newParticipant,
    token,
  }
}

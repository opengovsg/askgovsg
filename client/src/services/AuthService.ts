import { VerifyLoginOtpDto } from '~shared/types/api'
import { ApiClient } from '../api'

export const sendOtp = (email: string): Promise<void> => {
  return ApiClient.post('/auth/sendotp', { email })
}

export const verifyOtp = async (data: {
  email: string
  otp: string
}): Promise<
  // capitalise N in displayname key
  Omit<VerifyLoginOtpDto, 'displayname'> & { displayName: string }
> => {
  const {
    data: { displayname, newParticipant, token },
  } = await ApiClient.post<VerifyLoginOtpDto>('/auth/verifyotp', data)
  return {
    displayName: displayname,
    newParticipant,
    token,
  }
}

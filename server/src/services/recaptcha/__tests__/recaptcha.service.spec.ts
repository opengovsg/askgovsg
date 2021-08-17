import axios from 'axios'
import { mocked } from 'ts-jest/utils'
import { recaptchaConfig } from '../../../bootstrap/config/recaptcha'

import { GOOGLE_RECAPTCHA_URL } from '../recaptcha.constants'
import {
  CaptchaConnectionError,
  MissingCaptchaError,
  VerifyCaptchaError,
} from '../recaptcha.errors'
import { verifyCaptchaResponse } from '../recaptcha.service'

const MOCK_PRIVATE_KEY = recaptchaConfig.recaptchaSecretKey
const MOCK_RESPONSE = 'captchaResponse'
const MOCK_REMOTE_IP = 'remoteIp'
jest.mock('axios')
const MockAxios = mocked(axios, true)

describe('captcha.service', () => {
  describe('verifyCaptchaResponse', () => {
    beforeEach(() => jest.clearAllMocks())

    it('should return MissingCaptchaError when response is falsy', async () => {
      // Act
      const result = await verifyCaptchaResponse(null, undefined)

      // Assert
      expect(result._unsafeUnwrapErr()).toEqual(new MissingCaptchaError())
    })

    it('should return VerifyCaptchaError when captcha response is incorrect', async () => {
      // Arrange
      MockAxios.get.mockResolvedValueOnce({ data: { success: false } })

      // Act
      const result = await verifyCaptchaResponse(MOCK_RESPONSE, MOCK_REMOTE_IP)

      // Assert
      expect(MockAxios.get).toHaveBeenCalledWith(GOOGLE_RECAPTCHA_URL, {
        params: {
          secret: MOCK_PRIVATE_KEY,
          response: MOCK_RESPONSE,
          remoteip: MOCK_REMOTE_IP,
        },
      })
      expect(result._unsafeUnwrapErr()).toEqual(new VerifyCaptchaError())
    })

    it('should return true when captcha response is correct', async () => {
      // Arrange
      MockAxios.get.mockResolvedValueOnce({ data: { success: true } })

      // Act
      const result = await verifyCaptchaResponse(MOCK_RESPONSE, MOCK_REMOTE_IP)

      // Assert
      expect(MockAxios.get).toHaveBeenCalledWith(GOOGLE_RECAPTCHA_URL, {
        params: {
          secret: MOCK_PRIVATE_KEY,
          response: MOCK_RESPONSE,
          remoteip: MOCK_REMOTE_IP,
        },
      })
      expect(result._unsafeUnwrap()).toEqual(true)
    })

    it('should return CaptchaConnectionError when connection with captcha server fails', async () => {
      // Arrange
      MockAxios.get.mockRejectedValueOnce(false)

      // Act
      const result = await verifyCaptchaResponse(MOCK_RESPONSE, MOCK_REMOTE_IP)

      // Assert
      expect(MockAxios.get).toHaveBeenCalledWith(GOOGLE_RECAPTCHA_URL, {
        params: {
          secret: MOCK_PRIVATE_KEY,
          response: MOCK_RESPONSE,
          remoteip: MOCK_REMOTE_IP,
        },
      })
      expect(result._unsafeUnwrapErr()).toEqual(new CaptchaConnectionError())
    })
  })
})

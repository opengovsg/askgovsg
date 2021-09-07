import {
  CaptchaConnectionError,
  MissingCaptchaError,
  VerifyCaptchaError,
} from '../recaptcha.errors'
import { RecaptchaService } from '../recaptcha.service'

const MOCK_RESPONSE = 'captchaResponse'
const MOCK_REMOTE_IP = 'remoteIp'

describe('recaptcha.service', () => {
  const axios = { get: jest.fn() }
  const googleRecaptchaURL = 'https://recaptcha.net'
  const recaptchaSecretKey = ''

  const recaptchaService = new RecaptchaService({
    axios,
    googleRecaptchaURL,
    recaptchaSecretKey,
  })

  describe('verifyCaptchaResponse', () => {
    beforeEach(() => jest.clearAllMocks())

    it('should return MissingCaptchaError when response is falsy', async () => {
      // Act
      const result = await recaptchaService.verifyCaptchaResponse(
        null,
        undefined,
      )

      // Assert
      expect(result._unsafeUnwrapErr()).toEqual(new MissingCaptchaError())
    })

    it('should return VerifyCaptchaError when captcha response is incorrect', async () => {
      // Arrange
      axios.get.mockResolvedValueOnce({ data: { success: false } })

      // Act
      const result = await recaptchaService.verifyCaptchaResponse(
        MOCK_RESPONSE,
        MOCK_REMOTE_IP,
      )

      // Assert
      expect(axios.get).toHaveBeenCalledWith(googleRecaptchaURL, {
        params: {
          secret: recaptchaSecretKey,
          response: MOCK_RESPONSE,
          remoteip: MOCK_REMOTE_IP,
        },
      })
      expect(result._unsafeUnwrapErr()).toEqual(new VerifyCaptchaError())
    })

    it('should return true when captcha response is correct', async () => {
      // Arrange
      axios.get.mockResolvedValueOnce({ data: { success: true } })

      // Act
      const result = await recaptchaService.verifyCaptchaResponse(
        MOCK_RESPONSE,
        MOCK_REMOTE_IP,
      )

      // Assert
      expect(axios.get).toHaveBeenCalledWith(googleRecaptchaURL, {
        params: {
          secret: recaptchaSecretKey,
          response: MOCK_RESPONSE,
          remoteip: MOCK_REMOTE_IP,
        },
      })
      expect(result._unsafeUnwrap()).toEqual(true)
    })

    it('should return CaptchaConnectionError when connection with captcha server fails', async () => {
      // Arrange
      axios.get.mockRejectedValueOnce(false)

      // Act
      const result = await recaptchaService.verifyCaptchaResponse(
        MOCK_RESPONSE,
        MOCK_REMOTE_IP,
      )

      // Assert
      expect(axios.get).toHaveBeenCalledWith(googleRecaptchaURL, {
        params: {
          secret: recaptchaSecretKey,
          response: MOCK_RESPONSE,
          remoteip: MOCK_REMOTE_IP,
        },
      })
      expect(result._unsafeUnwrapErr()).toEqual(new CaptchaConnectionError())
    })
  })
})

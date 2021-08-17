import axios from 'axios'
import { createLogger } from '../../bootstrap/logging'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'
import { recaptchaConfig } from '../../bootstrap/config/recaptcha'

import { GOOGLE_RECAPTCHA_URL } from './recaptcha.constants'
import {
  CaptchaConnectionError,
  MissingCaptchaError,
  VerifyCaptchaError,
} from './recaptcha.errors'

const logger = createLogger(module)
export const verifyCaptchaResponse = (
  response?: unknown,
  remoteip?: string,
): ResultAsync<
  true,
  CaptchaConnectionError | VerifyCaptchaError | MissingCaptchaError
> => {
  if (!response || typeof response !== 'string') {
    return errAsync(new MissingCaptchaError())
  }
  const verifyCaptchaPromise = axios.get<{ success: boolean }>(
    GOOGLE_RECAPTCHA_URL,
    {
      params: {
        secret: recaptchaConfig.recaptchaSecretKey,
        response,
        remoteip,
      },
    },
  )
  return ResultAsync.fromPromise(verifyCaptchaPromise, (error) => {
    logger.error({
      message: 'Error verifying captcha',
      meta: {
        function: 'verifyCaptchaPromise',
      },
      error,
    })
    return new CaptchaConnectionError()
  }).andThen(({ data }) => {
    if (!data.success) {
      logger.warn({
        message: 'Incorrect captcha response',
        meta: {
          function: 'verifyCaptchaPromise',
        },
      })
      return errAsync(new VerifyCaptchaError())
    }
    return okAsync(true)
  })
}

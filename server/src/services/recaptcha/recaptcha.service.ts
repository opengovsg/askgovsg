import { AxiosStatic } from 'axios'
import { createLogger } from '../../bootstrap/logging'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'
import { recaptchaConfig } from '../../bootstrap/config/recaptcha'

import {
  CaptchaConnectionError,
  MissingCaptchaError,
  VerifyCaptchaError,
} from './recaptcha.errors'

const logger = createLogger(module)
export class RecaptchaService {
  private axios: Pick<AxiosStatic, 'get'>

  constructor({ axios }: { axios: Pick<AxiosStatic, 'get'> }) {
    this.axios = axios
  }

  public verifyCaptchaResponse = (
    response?: unknown,
    remoteip?: string,
  ): ResultAsync<
    true,
    CaptchaConnectionError | VerifyCaptchaError | MissingCaptchaError
  > => {
    if (!response || typeof response !== 'string') {
      return errAsync(new MissingCaptchaError())
    }
    const verifyCaptchaPromise = this.axios.get<{ success: boolean }>(
      recaptchaConfig.googleRecaptchaURL,
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
}

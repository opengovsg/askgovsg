import { AxiosStatic } from 'axios'
import { createLogger } from '../../bootstrap/logging'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'

import {
  CaptchaConnectionError,
  MissingCaptchaError,
  VerifyCaptchaError,
} from './recaptcha.errors'

const logger = createLogger(module)
export class RecaptchaService {
  private axios: Pick<AxiosStatic, 'get'>
  private googleRecaptchaURL: string
  private recaptchaSecretKey: string

  constructor({
    axios,
    googleRecaptchaURL,
    recaptchaSecretKey,
  }: {
    axios: Pick<AxiosStatic, 'get'>
    googleRecaptchaURL: string
    recaptchaSecretKey: string
  }) {
    this.axios = axios
    this.googleRecaptchaURL = googleRecaptchaURL
    this.recaptchaSecretKey = recaptchaSecretKey
  }

  public verifyCaptchaResponse = (
    response?: unknown,
    remoteip?: string,
  ): ResultAsync<
    boolean,
    CaptchaConnectionError | VerifyCaptchaError | MissingCaptchaError
  > => {
    if (!response || typeof response !== 'string') {
      return errAsync(new MissingCaptchaError())
    }
    const verifyCaptchaPromise = this.axios.get<{ success: boolean }>(
      this.googleRecaptchaURL,
      {
        params: {
          secret: this.recaptchaSecretKey,
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

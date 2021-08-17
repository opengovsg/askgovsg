import { StatusCodes } from 'http-status-codes'
import {
  CaptchaConnectionError,
  MissingCaptchaError,
  VerifyCaptchaError,
} from './recaptcha.errors'
import { createLogger } from '../../bootstrap/logging'

const logger = createLogger(module)

type ErrorResponseData = {
  statusCode: StatusCodes
  errorMessage: string
}

export const mapRouteError = (error: VerifyCaptchaError): ErrorResponseData => {
  switch (error.constructor) {
    case CaptchaConnectionError:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        errorMessage:
          'Could not verify captcha. Please submit again in a few minutes.',
      }
    case VerifyCaptchaError:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        errorMessage: 'Captcha was incorrect. Please submit again.',
      }
    case MissingCaptchaError:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        errorMessage: 'Captcha was missing. Please refresh and submit again.',
      }
    default:
      logger.error({
        message: 'mapRouteError called with unknown error type',
        meta: {
          function: 'mapRouteError',
        },
        error,
      })
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        errorMessage: 'Sorry, something went wrong. Please try again.',
      }
  }
}

import { ApplicationError } from '../core/core.errors'
import { StatusCodes } from 'http-status-codes'

export class MissingAgencyError extends ApplicationError {
  constructor(
    message = 'Agency not found',
    statusCode = StatusCodes.NOT_FOUND,
  ) {
    super(message, statusCode)
  }
}

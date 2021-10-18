import { ApplicationError } from '../core/core.errors'
import { StatusCodes } from 'http-status-codes'

export class MissingTopicError extends ApplicationError {
  constructor(message = 'Topic not found', statusCode = StatusCodes.NOT_FOUND) {
    super(message, statusCode)
  }
}

import { StatusCodes } from 'http-status-codes'

/**
 * A custom base error class that encapsulates the name, message and status code
 */
export class ApplicationError extends Error {
  statusCode: StatusCodes

  constructor(message?: string, statusCode?: StatusCodes) {
    super()

    Error.captureStackTrace(this, this.constructor)

    this.name = this.constructor.name

    this.message = message || 'Something went wrong. Please try again.'

    this.statusCode = statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  }
}

/**
 * Error thrown when database query fails
 */
export class DatabaseError extends ApplicationError {
  constructor(
    message?: string,
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  ) {
    super(message, statusCode)
  }
}

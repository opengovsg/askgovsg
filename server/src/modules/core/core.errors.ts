/**
 * A custom base error class that encapsulates the name, message, status code,
 * and logging meta string (if any) for the error.
 */
export class ApplicationError extends Error {
  /**
   * Meta object to be logged by the application logger, if any.
   */
  meta?: unknown

  constructor(message?: string, meta?: unknown) {
    super()

    Error.captureStackTrace(this, this.constructor)

    this.name = this.constructor.name

    this.message = message || 'Something went wrong. Please try again.'

    this.meta = meta
  }
}

/**
 * Error thrown when database query fails
 */
export class DatabaseError extends ApplicationError {
  constructor(message?: string) {
    super(message)
  }
}

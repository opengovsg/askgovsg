import { ApplicationError } from '../core/core.errors'

export class MissingAgencyError extends ApplicationError {
  constructor(message = 'Agency not found') {
    super(message)
  }
}

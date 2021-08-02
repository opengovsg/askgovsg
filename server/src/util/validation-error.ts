import { Result, ValidationError } from 'express-validator'

export const createValidationErrMessage = (
  errors: Result<ValidationError>,
): string =>
  errors
    .formatWith(({ msg }) => msg)
    .array()
    .join(', ')

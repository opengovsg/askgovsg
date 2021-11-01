import { StatusCodes } from 'http-status-codes'
import { ApplicationError } from '../core/core.errors'

export class MissingPublicPostError extends ApplicationError {
  constructor(
    message = 'No public post with this id',
    statusCode = StatusCodes.NOT_FOUND,
  ) {
    super(message, statusCode)
  }
}

export class TagDoesNotExistError extends ApplicationError {
  constructor(
    message = 'At least one tag does not exist',
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  ) {
    super(message, statusCode)
  }
}

export class TopicDoesNotExistError extends ApplicationError {
  constructor(
    message = 'Topic does not exist',
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  ) {
    super(message, statusCode)
  }
}

export class InvalidTagsAndTopicsError extends ApplicationError {
  constructor(
    message = 'At least one valid tag or topic is required',
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  ) {
    super(message, statusCode)
  }
}

export class InvalidTagsError extends ApplicationError {
  constructor(
    message = 'Invalid tags used in request',
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  ) {
    super(message, statusCode)
  }
}

export class InvalidTopicsError extends ApplicationError {
  constructor(
    message = 'Invalid topics used in request',
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  ) {
    super(message, statusCode)
  }
}

export class MissingUserIdError extends ApplicationError {
  constructor(
    message = 'Unable to find user with given ID',
    statusCode = StatusCodes.NOT_FOUND,
  ) {
    super(message, statusCode)
  }
}

export class PostUpdateError extends ApplicationError {
  constructor(
    message = 'Post update failed',
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  ) {
    super(message, statusCode)
  }
}

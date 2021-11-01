import { validationResult } from 'express-validator'
import { AnswersService } from './answers.service'
import { AuthService } from '../auth/auth.service'
import { createLogger } from '../../bootstrap/logging'
import { StatusCodes } from 'http-status-codes'
import { ControllerHandler } from '../../types/response-handler'
import { Message } from '../../types/message-type'
import { Answer } from '~shared/types/base'

const logger = createLogger(module)

export class AnswersController {
  private answersService: Public<AnswersService>
  private authService: Public<AuthService>

  constructor({
    answersService,
    authService,
  }: {
    answersService: Public<AnswersService>
    authService: Public<AuthService>
  }) {
    this.answersService = answersService
    this.authService = authService
  }

  /**
   * Lists all answers to a post
   * @param postId id of the post
   * @returns 200 with array of answers
   * @returns 500 if database error occurs
   */
  listAnswers: ControllerHandler<{ id: string }, Answer[] | Message> = async (
    req,
    res,
  ) => {
    try {
      const answers = await this.answersService.listAnswers(
        Number(req.params.id),
      )
      return res.status(StatusCodes.OK).json(answers)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving answers for post',
        meta: {
          function: 'getAnswers',
          postId: req.params.id,
        },
        error,
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server Error' })
    }
  }

  /**
   * Create an answer attached to a post
   * @param postId id of post to attach to
   * @body text answer text
   * @returns 200 with new answer id
   * @returns 400 if invalid request
   * @returns 401 if user not signed in
   * @returns 403 if user is not authorized to answer question
   * @returns 500 if database error
   */
  createAnswer: ControllerHandler<
    { id: string },
    number | Message,
    { text: string },
    undefined
  > = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: errors.array()[0].msg })
    }
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'User not signed in' })
    }

    try {
      // Check permissions
      const hasAnswerPermissions = await this.authService.hasPermissionToAnswer(
        req.user.id,
        Number(req.params.id),
      )
      if (!hasAnswerPermissions) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: 'You do not have permissions to answer question' })
      }
      // Save Answer in the database
      const data = await this.answersService.createAnswer({
        body: req.body.text,
        userId: Number(req.user.id),
        postId: Number(req.params.id),
      })

      return res.status(StatusCodes.OK).json(data)
    } catch (error) {
      logger.error({
        message: 'Error while adding new answer',
        meta: {
          function: 'addAnswer',
          userId: req.user.id,
          postId: req.params.id,
        },
        error,
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server Error' })
    }
  }

  /**
   * Update an answer
   * @param id id of answer to update
   * @body text answer text
   * @returns 200 with number of rows changed in answer database
   * @returns 400 if invalid request
   * @returns 500 if database error
   */
  updateAnswer: ControllerHandler<
    { id: string },
    number | Message,
    { text: string },
    undefined
  > = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: errors.array()[0].msg })
    }
    try {
      // Update Answer in the database
      const data = await this.answersService.updateAnswer({
        body: req.body.text,
        id: Number(req.params.id),
      })
      return res.status(StatusCodes.OK).json(data)
    } catch (error) {
      logger.error({
        message: 'Error while updating answer',
        meta: {
          function: 'updateAnswer',
          answerId: req.params.id,
        },
        error,
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server Error' })
    }
  }

  /**
   * Delete an answer. Currently not used as a post delete
   * will archive the post and will not touch the answer.
   * @param id of answer to delete
   * @returns 200 on successful delete
   * @returns 500 on database error
   */
  deleteAnswer: ControllerHandler<{ id: string }, Message> = async (
    req,
    res,
  ) => {
    try {
      await this.answersService.deleteAnswer(Number(req.params.id))
      return res.status(StatusCodes.OK).end()
    } catch (error) {
      logger.error({
        message: 'Error while deleting answer',
        meta: {
          function: 'deleteAnswer',
          answerId: req.params.id,
        },
        error,
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server Error' })
    }
  }
}

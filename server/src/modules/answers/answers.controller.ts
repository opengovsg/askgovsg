import { validationResult } from 'express-validator'
import { AnswersService } from './answers.service'
import { AuthService } from '../auth/auth.service'
import { Request, Response } from 'express'
import { createLogger } from '../../bootstrap/logging'
import { StatusCodes } from 'http-status-codes'

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

  getAnswers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const answers = await this.answersService.retrieveAll(req.params.id)
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

  addAnswer = async (req: Request, res: Response): Promise<Response> => {
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
        req.params.id,
      )
      if (!hasAnswerPermissions) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: 'You do not have permissions to answer question' })
      }
      // Save Answer in the database
      const data = await this.answersService.createAnswer({
        body: req.body.text,
        userId: req.user.id,
        postId: req.params.id,
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

  updateAnswer = async (
    req: Request,
    res: Response,
  ): Promise<Response | undefined> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: errors.array()[0].msg })
    }
    try {
      // Update Answer in the database
      const data = await this.answersService.update({
        body: req.body.text,
        id: req.params.id,
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

  deleteAnswer = async (req: Request, res: Response): Promise<unknown> => {
    try {
      await this.answersService.remove(req.params.id)
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

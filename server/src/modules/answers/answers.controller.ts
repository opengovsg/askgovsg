import { validationResult } from 'express-validator'
import helperFunction from '../../helpers/helperFunction'
import { AnswersService } from './answers.service'
import { AuthService } from '../auth/auth.service'
import { Request, Response } from 'express'
import { createLogger } from '../../bootstrap/logging'

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
      return res.status(200).json(answers)
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
        .status(500)
        .json(helperFunction.responseHandler(false, 500, 'Server Error', null))
    }
  }

  addAnswer = async (req: Request, res: Response): Promise<Response> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }
    if (!req.user) {
      return res.status(401).json({ message: 'User not signed in' })
    }

    try {
      // Check permissions
      const hasAnswerPermissions = await this.authService.hasPermissionToAnswer(
        req.user.id,
        req.params.id,
      )
      if (!hasAnswerPermissions) {
        return res
          .status(403)
          .json({ message: 'You do not have permissions to answer question' })
      }
      // Save Answer in the database
      const data = await this.answersService.createAnswer({
        body: req.body.text,
        userId: req.user.id,
        postId: req.params.id,
      })

      return res.status(201).json(data)
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
      return res.status(500).json({ message: 'Server Error' })
    }
  }

  updateAnswer = async (
    req: Request,
    res: Response,
  ): Promise<Response | undefined> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }
    try {
      // Update Answer in the database
      const data = await this.answersService.update({
        body: req.body.text,
        id: req.params.id,
      })
      return res.status(200).json(data)
    } catch (error) {
      logger.error({
        message: 'Error while updating answer',
        meta: {
          function: 'updateAnswer',
          answerId: req.params.id,
        },
        error,
      })
      return res.status(500).json({ message: 'Server Error' })
    }
  }

  deleteAnswer = async (req: Request, res: Response): Promise<unknown> => {
    try {
      this.answersService.remove(req.params.id, (error, data) => {
        if (error) {
          logger.error({
            message: 'Error while deleting answer',
            meta: {
              function: 'deleteAnswer',
              answerId: req.params.id,
            },
            error,
          })
          return res.status(error.code).json(error)
        }
        // Assuming that if err returned null then data is defined
        return res.status(data!.code).json(data)
      })
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
        .status(500)
        .json(helperFunction.responseHandler(false, 500, 'Server Error', null))
    }
  }
}

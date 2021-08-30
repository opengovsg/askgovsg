import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { createLogger } from '../../bootstrap/logging'
import { ControllerHandler } from '../../types/response-handler'
import { AuthService } from '../auth/auth.service'
import { TagsService } from './tags.service'

const logger = createLogger(module)

export class TagsController {
  private tagsService: Public<TagsService>
  private authService: Public<AuthService>
  constructor({
    authService,
    tagsService,
  }: {
    authService: Public<AuthService>
    tagsService: Public<TagsService>
  }) {
    this.authService = authService
    this.tagsService = tagsService
  }
  getTags = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const data = await this.tagsService.retrieveAll()
      return res.status(StatusCodes.OK).json(data)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving all tags',
        meta: {
          function: 'getTags',
        },
        error,
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server Error' })
    }
  }

  getTagsUsedByUser: ControllerHandler = async (req, res) => {
    const userId = await this.authService.getUserIdFromToken(
      req.header('x-auth-token') ?? '',
    )
    if (!userId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'You must be logged in to retrieve tags.' })
    }

    try {
      const result = await this.tagsService.retrieveUsedByUser(userId)
      return res.json(result)
    } catch (err) {
      if (err instanceof Error) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: err.message })
      } else {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: 'Server Error' })
      }
    }
  }

  getSingleTag = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = await this.tagsService.retrieveOne(req.params.tagname)
      return res.status(StatusCodes.OK).json(data)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving single tag',
        meta: {
          function: 'getSingleTag',
        },
        error,
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server Error' })
    }
  }

  getTagsUsedByAgency: ControllerHandler<{ agencyId: string }> = async (
    req,
    res,
  ) => {
    const { agencyId } = req.params
    try {
      const result = await this.tagsService.retrieveUsedByAgency(agencyId)
      return res.json(result)
    } catch (err) {
      if (err instanceof Error) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: err.message })
      } else {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: 'Server Error' })
      }
    }
  }
}

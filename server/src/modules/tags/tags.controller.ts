import { Request, Response } from 'express'
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
      return res.status(200).json(data)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving all tags',
        meta: {
          function: 'getTags',
        },
        error,
      })
      return res.status(500).json({ message: 'Server Error' })
    }
  }

  getTagsUsedByUser: ControllerHandler = async (req, res) => {
    const userId = await this.authService.getUserIdFromToken(
      req.header('x-auth-token') ?? '',
    )
    if (!userId) {
      return res
        .status(401)
        .json({ message: 'You must be logged in to retrieve tags.' })
    }

    try {
      const result = await this.tagsService.retrieveUsedByUser(userId)
      return res.json(result)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  getSingleTag = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = await this.tagsService.retrieveOne(req.params.tagname)
      return res.status(200).json(data)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving single tag',
        meta: {
          function: 'getSingleTag',
        },
        error,
      })
      return res.status(500).json({ message: 'Server Error' })
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
      return res.status(400).json({ message: err.message })
    }
  }
}

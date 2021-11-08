import { StatusCodes } from 'http-status-codes'
import { Tag } from '~shared/types/base'
import { createLogger } from '../../bootstrap/logging'
import { Message } from '../../types/message-type'
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

  /**
   * List all tags in the descending order of number of posts with them
   * @returns 200 with tags
   * @returns 500 if database error
   */
  listTags: ControllerHandler<undefined, Tag[] | Message> = async (
    req,
    res,
  ) => {
    try {
      const data = await this.tagsService.listTags()
      return res.status(StatusCodes.OK).json(data)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving all tags',
        meta: {
          function: 'listTags',
        },
        error,
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server Error' })
    }
  }

  /**
   * Lists all tags that user is allowed to tag a post with
   * @returns 200 with tags
   * @returns 401 if user is not logged in
   * @returns 500 if database error
   */
  listTagsUsedByUser: ControllerHandler<undefined, Tag[] | Message> = async (
    req,
    res,
  ) => {
    const userId = req.user?.id
    if (!userId) {
      logger.error({
        message: 'UserId is undefined after authenticated',
        meta: {
          function: 'updatePost',
        },
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Something went wrong, please try again.' })
    }

    try {
      const result = await this.tagsService.listTagsUsedByUser(userId)
      return res.json(result)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving tags used by user',
        meta: {
          function: 'listTagsUsedByUser',
        },
        error,
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server Error' })
    }
  }

  /**
   * List all tags that have appeared in a post with the agency tag
   * @param agencyId id of agency
   * @returns 200 with list of tags
   * @returns 400 with database error
   */
  listTagsUsedByAgency: ControllerHandler<
    { agencyId: string },
    Tag[] | Message
  > = async (req, res) => {
    const { agencyId } = req.params
    try {
      const result = await this.tagsService.listTagsUsedByAgency(
        Number(agencyId),
      )
      return res.json(result)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving tags used by agency',
        meta: {
          function: 'listTagsUsedByAgency',
        },
        error,
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server Error' })
    }
  }

  /**
   * Get a single tag by name
   * @param tagname name of tag
   * @returns 200 with tag
   * @returns 500 if database error
   */
  getSingleTag: ControllerHandler<{ tagname: string }, Tag | Message> = async (
    req,
    res,
  ) => {
    try {
      const data = await this.tagsService.getSingleTag(req.params.tagname)
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
}

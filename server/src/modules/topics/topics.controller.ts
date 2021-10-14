import { validationResult } from 'express-validator'
import { TopicsService } from './topics.service'
import { Topic } from '~shared/types/base'
import { UpdateTopicRequestDto } from '../../types/topic-type'
import { Message } from '../../types/message-type'
import { StatusCodes } from 'http-status-codes'
import { ControllerHandler } from '../../types/response-handler'
import { TopicWithChildRelations } from './topics.service'

export class TopicsController {
  private topicsService: Public<TopicsService>

  constructor({ topicsService }: { topicsService: Public<TopicsService> }) {
    this.topicsService = topicsService
  }

  /**
   * Lists all topics in an agency
   * @param id agencyId
   * @returns 200 with topics
   * @returns 404 if topics are not found
   * @returns 500 if database error
   */
  listTopicsUsedByAgency: ControllerHandler<
    { id: number },
    TopicWithChildRelations[] | Message
  > = async (req, res) => {
    const agencyId = Number(req.params.id)
    return this.topicsService
      .listTopicsUsedByAgency(agencyId)
      .map((data) => res.status(StatusCodes.OK).json(data))
      .mapErr((error) => {
        return res.status(error.statusCode).json({ message: error.message })
      })
  }

  /**
   * Create a new topic
   * @body name name of topic
   * @body description description of topic
   * @body agencyId id of agency
   * @body parentId id of parent topic
   * @return 200 if topic is created
   * @return 400 if name and description is too short or long
   * @return 401 if user is not signed in
   * @return 403 if user does not have permission to create a topic
   * @return 500 if database error
   */
  createTopic: ControllerHandler<
    undefined,
    Topic | Message,
    {
      name: string
      description: string
      agencyId: number
      parentId: number
    },
    undefined
  > = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json(errors.array()[0].msg)
    }
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'User not signed in' })
    }

    // TODO: check permissions here and return 403 error

    return this.topicsService
      .createTopic({
        name: req.body.name,
        description: req.body.description,
        agencyId: req.body.agencyId,
        parentId: req.body.parentId,
      })
      .map((data) => res.status(StatusCodes.OK).json(data))
      .mapErr((error) => {
        return res.status(error.statusCode).json({ message: error.message })
      })
  }

  /**
   * Delete a topic
   * @param id Topic to be deleted
   * @return 200 if successful
   * @return 401 if user is not logged in
   * @return 403 if user does not have permission to delete topic
   * @return 500 if database error
   */
  deleteTopic: ControllerHandler<{ id: string }, Message> = async (
    req,
    res,
  ) => {
    const topicId = Number(req.params.id)

    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'User not signed in' })
    }

    // TODO: check permissions here and return 403 error

    return this.topicsService
      .deleteTopicById(topicId)
      .map(() => res.status(StatusCodes.OK).json({ message: 'OK' }))
      .mapErr((error) => {
        return res.status(error.statusCode).json({ message: error.message })
      })
  }

  /**
   * Update a topic
   * @param id id of topic to update
   * @body Topic Topic to be updated
   * @return 200 if successful
   * @return 400 if name and description is too short or long
   * @return 401 if user is not logged in
   * @return 403 if user does not have permission to delete topic
   * @return 500 if database error
   */
  updateTopic: ControllerHandler<
    { id: string },
    Message,
    UpdateTopicRequestDto,
    undefined
  > = async (req, res) => {
    const topicId = Number(req.params.id)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json(errors.array()[0].msg)
    }
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'User not signed in' })
    }

    // TODO: check permissions here and return 403 error

    return this.topicsService
      .updateTopicById({
        name: req.body.name,
        description: req.body.description ?? '',
        parentId: req.body.parentId,
        id: topicId,
      })
      .map(() => res.status(StatusCodes.OK).json({ message: 'Topic updated' }))
      .mapErr((error) => {
        return res.status(error.statusCode).json({ message: error.message })
      })
  }
}

import { validationResult } from 'express-validator'
import { TopicsService } from './topics.service'
import { AuthService } from '../auth/auth.service'
import { Topic } from '~shared/types/base'
import { UpdateTopicRequestDto } from '../../types/topic-type'
import { Message } from '../../types/message-type'
import { StatusCodes } from 'http-status-codes'
import { ControllerHandler } from '../../types/response-handler'
import { TopicWithChildRelations } from './topics.service'

export class TopicsController {
  private authService: Public<AuthService>
  private topicsService: Public<TopicsService>

  constructor({
    authService,
    topicsService,
  }: {
    authService: Public<AuthService>
    topicsService: Public<TopicsService>
  }) {
    this.authService = authService
    this.topicsService = topicsService
  }

  /**
   * Lists all topics
   * @returns 200 with topics
   * @returns 404 if topics are not found
   * @returns 500 if database error
   */

  listTopics: ControllerHandler<
    undefined,
    TopicWithChildRelations[] | Message
  > = async (req, res) => {
    return this.topicsService
      .listTopics()
      .map((data) => res.status(StatusCodes.OK).json(data))
      .mapErr((error) => {
        return res.status(error.statusCode).json({ message: error.message })
      })
  }

  /**
   * Lists all topics in an agency
   * @param agencyId agencyId
   * @returns 200 with topics
   * @returns 404 if topics are not found
   * @returns 500 if database error
   */
  listTopicsUsedByAgency: ControllerHandler<
    { agencyId: number },
    TopicWithChildRelations[] | Message
  > = async (req, res) => {
    const agencyId = Number(req.params.agencyId)
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

    // Check if user and topic share the same agency
    const userId = req.user?.id
    const hasPermission = await this.authService.verifyUserInAgency(
      userId,
      req.body.agencyId,
    )
    if (!hasPermission) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'You do not have permission to create this topic' })
    }

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

    // Check if user and topic share the same agency
    const userId = req.user?.id
    const hasPermission = await this.authService.verifyUserCanModifyTopic(
      topicId,
      userId,
    )
    if (!hasPermission) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'You do not have permission to delete this topic' })
    }

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

    // Check if user and topic share the same agency
    const userId = req.user?.id
    const hasPermission = await this.authService.verifyUserCanModifyTopic(
      topicId,
      userId,
    )
    if (!hasPermission) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'You do not have permission to update this topic' })
    }

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

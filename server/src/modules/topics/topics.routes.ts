import { AuthMiddleware } from '../auth/auth.middleware'
import express from 'express'
import { check, param } from 'express-validator'
import { TopicsController } from './topics.controller'

export const routeTopics = ({
  controller,
  authMiddleware,
}: {
  controller: TopicsController
  authMiddleware: Public<AuthMiddleware>
}): express.Router => {
  const router = express.Router()

  /**
   * Find a topic by its id
   * @route GET /api/topics/:topicId
   * @return 200 with topic
   * @return 404 if topic not found
   * @return 500 if database error
   */
  router.get(
    '/:topicId',
    param('topicId').isInt().toInt(),
    controller.getTopicById,
  )

  /**
   * List all topics
   * @return 200 with topics
   * @return 400 with database error
   */
  router.get('/', controller.listTopics)

  /**
   * Create a new topic
   * @route  POST /api/topics
   * @return 200 if topic is created
   * @return 400 if name and description is too short or long
   * @return 401 if user is not signed in
   * @return 403 if user does not have permission to create a topic
   * @return 500 if database error
   */
  router.post(
    '/',
    [
      authMiddleware.authenticate,
      check(
        'name',
        'Enter a topic name with minimum 1 character and maximum 30 characters',
      ).isLength({
        min: 1,
        max: 30,
      }),
      check('description', 'Enter a description with minimum 10 characters')
        .isLength({
          min: 10,
        })
        .optional({ nullable: true, checkFalsy: true }),
    ],
    controller.createTopic,
  )

  /**
   * Delete a topic
   * @route  DELETE /api/topics/:id
   * @return 200 if successful
   * @return 401 if user is not logged in
   * @return 403 if user does not have permission to delete topic
   * @return 500 if database error
   * @access Private
   */
  router.delete(
    '/:id([0-9]+$)',
    authMiddleware.authenticate,
    controller.deleteTopic,
  )

  /**
   * Update a topic
   * @route  PUT /api/topics/:id
   * @return 200 if successful
   * @return 400 if title and description is too short or long
   * @return 401 if user is not logged in
   * @return 403 if user does not have permission to delete topic
   * @return 500 if database error
   * @access Private
   */
  router.put(
    '/:id([0-9]+$)',
    [
      authMiddleware.authenticate,
      check(
        'name',
        'Enter a topic name with minimum 1 character and maximum 30 characters',
      ).isLength({
        min: 1,
        max: 30,
      }),
      check('description', 'Enter a description with minimum 10 characters')
        .isLength({
          min: 10,
        })
        .optional({ nullable: true, checkFalsy: true }),
    ],
    controller.updateTopic,
  )

  return router
}

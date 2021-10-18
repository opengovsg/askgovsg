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
      check('description', 'Enter a description with minimum 30 characters')
        .isLength({
          min: 30,
        })
        .optional({ nullable: true, checkFalsy: true }),
    ],
    controller.createTopic,
  )

  /**
   * Delete a post
   * @route  DELETE /api/posts/:id
   * @return 200 if successful
   * @return 401 if user is not logged in
   * @return 403 if user does not have permission to delete post
   * @return 500 if database error
   * @access Private
   */
  router.delete('/:id([0-9]+$)', controller.deleteTopic)

  /**
   * Update a post
   * @route  PUT /api/posts/:id
   * @return 200 if successful
   * @return 400 if title and description is too short or long
   * @return 401 if user is not logged in
   * @return 403 if user does not have permission to delete post
   * @return 500 if database error
   * @access Private
   */
  router.put('/:id([0-9]+$)', controller.updateTopic)

  return router
}

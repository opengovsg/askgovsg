import { AuthMiddleware } from '../auth/auth.middleware'
import checkOwnership from '../../middleware/checkOwnership'
import express from 'express'
import { check } from 'express-validator'
import { AnswersController } from './answers.controller'

export const routeAnswers = ({
  controller,
  authMiddleware,
}: {
  controller: AnswersController
  authMiddleware: AuthMiddleware
}): express.Router => {
  const router = express.Router()
  const { authenticate } = authMiddleware

  /**
   * Lists all answers to a post
   * @route   GET /api/posts/answers/:id
   * @returns 200 with array of answers
   * @returns 500 if database error occurs
   * @access  Public
   */
  router.get('/:id', controller.listAnswers)

  /**
   * Create an answer attached to a post
   * @route   POST /api/posts/answers/:id
   * @returns 200 with new answer id
   * @returns 400 if invalid request
   * @returns 401 if user not signed in
   * @returns 403 if user is not authorized to answer question
   * @returns 500 if database error
   * @access  Private
   */
  router.post(
    '/:id',
    [authenticate, check('text', 'Answer is required').not().isEmpty()],
    controller.createAnswer,
  )

  /**
   * Update an answer
   * @route   PUT /api/posts/answers/:id
   * @returns 200 with number of rows changed in answer database
   * @returns 400 if invalid request
   * @returns 500 if database error
   * @access  Private
   */
  router.put(
    '/:id',
    [
      authenticate,
      checkOwnership,
      check('text', 'Answer is required').not().isEmpty(),
    ],
    controller.updateAnswer,
  )

  /**
   * Delete an answer. Currently not used as a post delete
   * will archive the post and will not touch the answer.
   * @route   DELETE /api/posts/answers/:id
   * @returns 200 on successful delete
   * @returns 500 on database error
   * @access  Private
   */
  router.delete('/:id', [authenticate, checkOwnership], controller.deleteAnswer)
  return router
}

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
   * @route      GET /api/posts/answers/:id
   * @desc       fetch all answers of a post
   * @access     Public
   */
  router.get('/:id', controller.getAnswers)

  /**
   * @route      POST /api/posts/answers/:id
   * @desc       add an answer to a post
   * @access     Private
   */
  router.post(
    '/:id',
    [authenticate, check('text', 'Answer is required').not().isEmpty()],
    controller.createAnswer,
  )

  /**
   * @route      PUT /api/posts/answers/:id
   * @desc       update answer to a post
   * @access     Private
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
   * @route      DELETE /api/posts/answers/:id
   * @desc       delete an answer to a post
   * @access     Private
   */
  router.delete('/:id', [authenticate, checkOwnership], controller.deleteAnswer)
  return router
}

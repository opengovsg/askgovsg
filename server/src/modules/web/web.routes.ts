import express from 'express'
import { param } from 'express-validator'
import { WebController } from './web.controller'

export const routeWeb = ({
  controller,
}: {
  controller: WebController
}): express.Router => {
  const router = express.Router()

  /**
   * Lists all answers to a post
   * @route   GET /agency/:shortname
   * @returns 200 with static agency page
   * @returns 500 if agency does not exist
   * @access  Private
   */
  router.get('/agency/:shortname', controller.getAgencyPage)

  /**
   * Lists all answers to a post
   * @route   GET /questions/:id
   * @returns 200 with static post page
   * @returns 500 if post or answers do not exist
   * @access  Public
   */
  router.get(
    '/questions/:id',
    [param('id').isInt().toInt()],
    controller.getQuestionPage,
  )

  return router
}

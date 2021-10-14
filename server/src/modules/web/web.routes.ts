import express from 'express'
import expressSitemapXml from 'express-sitemap-xml'
import { param } from 'express-validator'
import { baseConfig } from '../../bootstrap/config/base'
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
   * @returns 404 if agency does not exist
   * @returns 500 any other error
   * @access  Private
   */
  router.get('/agency/:shortname', controller.getAgencyPage)

  /**
   * Lists all answers to a post
   * @route   GET /questions/:id
   * @returns 200 with static post page
   * @returns 404 if post does not exist
   * @returns 500 if answers to post do not exist
   * @access  Public
   */
  router.get(
    '/questions/:id',
    [param('id').isInt().toInt()],
    controller.getQuestionPage,
  )

  /**
   * Serves sitemap
   * @route   USE /sitemap.xml
   * @returns sitemap
   * @access  Public
   */
  router.use(expressSitemapXml(controller.getSitemapUrls, baseConfig.hostUrl))

  return router
}

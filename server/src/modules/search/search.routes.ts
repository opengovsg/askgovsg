import express from 'express'
import { query } from 'express-validator'
import { SearchController } from './search.controller'

export const routeSearch = ({
  controller,
}: {
  controller: SearchController
}): express.Router => {
  const router = express.Router()

  /**
   * Lists all answers to a post
   * @route   GET /search
   * @returns 200 relevant search entries sorted by relevance
   * @returns 500 search request fails
   * @access  Public
   */
  router.get(
    '/',
    [
      query('agencyId').isInt().toInt().optional({ nullable: true }),
      query('query').isString().trim(),
    ],
    controller.searchPosts,
  )

  return router
}

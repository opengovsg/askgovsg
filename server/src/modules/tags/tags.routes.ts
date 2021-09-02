import express from 'express'
import { TagsController } from './tags.controller'
import { AuthMiddleware } from '../auth/auth.middleware'

export const routeTags = ({
  controller,
  authMiddleware,
}: {
  controller: TagsController
  authMiddleware: AuthMiddleware
}): express.Router => {
  const router = express.Router()
  /**
   * List all tags in the descending order of number of posts with them
   * @route   GET /api/tags
   * @returns 200 with tags
   * @returns 500 if database error
   * @access  public
   */
  router.get('/', controller.listTags)

  /**
   * Lists all tags that user is allowed to tag a post with
   * @route   GET /api/tags/user
   * @returns 200 with tags
   * @returns 401 if user is not logged in
   * @returns 500 if database error
   * @access  private
   */
  router.get(
    '/user',
    authMiddleware.authenticate,
    controller.listTagsUsedByUser,
  )

  /**
   * List all tags that have appeared in a post with the agency tag
   * @route   GET /api/tags/agency/:agencyId
   * @returns 200 with list of tags
   * @returns 400 with database error
   * @access  public
   */
  router.get('/agency/:agencyId', controller.listTagsUsedByAgency)

  /**
   * Get a single tag by name
   * @route   GET /api/tags/:tagname
   * @returns 200 with tag
   * @returns 500 if database error
   * @access  public
   */
  router.get('/:tagname', controller.getSingleTag)

  return router
}

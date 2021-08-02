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
   * @route      GET /api/tags
   * @desc       fetch all tags
   */
  router.get('/', controller.getTags)

  /**
   * @route      GET /api/tags/user
   * @desc       fetch tags that user can use
   */
  router.get('/user', authMiddleware.authenticate, controller.getTagsUsedByUser)

  /**
   * @route      GET /api/tags
   * @desc       fetch all tags
   */
  router.get('/agency/:agencyId', controller.getTagsUsedByAgency)

  /**
   * @route      GET /api/tags/:tagname
   * @desc       fetch a single tag
   */
  router.get('/:tagname', controller.getSingleTag)

  return router
}

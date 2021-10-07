import express from 'express'
import { AgencyController } from '../modules/agency/agency.controller'
import { routeAgencies } from '../modules/agency/agency.routes'
import { AnswersController } from '../modules/answers/answers.controller'
import { routeAnswers } from '../modules/answers/answers.routes'
import { AuthController } from '../modules/auth/auth.controller'
import { AuthMiddleware } from '../modules/auth/auth.middleware'
import { routeAuth } from '../modules/auth/auth.routes'
import { EnquiryController } from '../modules/enquiry/enquiry.controller'
import { routeEnquiries } from '../modules/enquiry/enquiry.routes'
import { EnvController } from '../modules/environment/env.controller'
import { routeEnv } from '../modules/environment/env.routes'
import { FileController } from '../modules/file/file.controller'
import { routeFiles } from '../modules/file/file.routes'
import { PostController } from '../modules/post/post.controller'
import { routePosts } from '../modules/post/post.routes'
import { TagsController } from '../modules/tags/tags.controller'
import { routeTags } from '../modules/tags/tags.routes'

type ApiRouterOptions = {
  agency: AgencyController
  answers: {
    controller: AnswersController
    authMiddleware: AuthMiddleware
  }
  auth: {
    controller: AuthController
    authMiddleware: AuthMiddleware
  }
  env: EnvController
  post: {
    controller: PostController
    authMiddleware: AuthMiddleware
  }
  tags: {
    controller: TagsController
    authMiddleware: AuthMiddleware
  }
  enquiries: EnquiryController
  file: {
    controller: FileController
    authMiddleware: AuthMiddleware
    maxFileSize: number
  }
}

export const api = (options: ApiRouterOptions): express.Router => {
  const router = express.Router()

  router.use('/auth', routeAuth(options.auth))
  router.use('/posts', routePosts(options.post))
  router.use('/tags', routeTags(options.tags))
  router.use('/files', routeFiles(options.file))
  router.use('/environment', routeEnv({ controller: options.env }))
  router.use('/posts/answers', routeAnswers(options.answers))
  router.use('/agencies', routeAgencies({ controller: options.agency }))
  router.use('/enquiries', routeEnquiries({ controller: options.enquiries }))

  return router
}

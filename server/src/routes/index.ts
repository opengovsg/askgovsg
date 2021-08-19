import express from 'express'

import { routeAuth } from '../modules/auth/auth.routes'
import { routePosts } from '../modules/post/post.routes'
import { routeTags } from '../modules/tags/tags.routes'
import { routeAnswers } from '../modules/answers/answers.routes'
import { routeAgencies } from '../modules/agency/agency.routes'
import { routeEnv } from '../modules/environment/env.routes'
import { routeEnquiries } from '../modules/enquiry/enquiry.routes'
import { routeFiles } from '../modules/file/file.routes'

import { EnvController } from '../modules/environment/env.controller'
import { AgencyController } from '../modules/agency/agency.controller'
import { AnswersController } from '../modules/answers/answers.controller'
import { AuthController } from '../modules/auth/auth.controller'
import { PostController } from '../modules/post/post.controller'
import { TagsController } from '../modules/tags/tags.controller'
import { FileController } from '../modules/file/file.controller'

import { AuthMiddleware } from '../modules/auth/auth.middleware'
import { EnquiryController } from '../modules/enquiry/enquiry.controller'

type ApiRouterOptions = {
  agency: AgencyController
  answers: {
    controller: AnswersController
    authMiddleware: AuthMiddleware
  }
  auth: {
    controller: AuthController
    middleware: AuthMiddleware
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

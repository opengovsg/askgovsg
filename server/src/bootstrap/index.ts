import bodyParser from 'body-parser'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import path from 'path'

import express from 'express'

import { emailValidator } from './email-validator'

import { api } from '../routes'
import { EnvController } from '../modules/environment/env.controller'
import { AgencyController } from '../modules/agency/agency.controller'
import { AnswersController } from '../modules/answers/answers.controller'
import { PostController } from '../modules/post/post.controller'
import { AuthController } from '../modules/auth/auth.controller'
import { TagsController } from '../modules/tags/tags.controller'
import { MailService } from '../modules/mail/mail.service'
import { AgencyService } from '../modules/agency/agency.service'
import { UserService } from '../modules/user/user.service'
import { AuthService } from '../modules/auth/auth.service'
import { TagsService } from '../modules/tags/tags.service'
import { AnswersService } from '../modules/answers/answers.service'
import { PostService } from '../modules/post/post.service'
import { AuthMiddleware } from '../modules/auth/auth.middleware'
import { baseConfig, Environment } from './config/base'
import { bannerConfig } from './config/banner'
import { googleAnalyticsConfig } from './config/googleAnalytics'
import { authConfig } from './config/auth'
import { fullStoryConfig } from './config/fullstory'
import { mailConfig } from './config/mail'
import { requestLoggingMiddleware } from './logging'

import { helmetOptions } from './helmet-options'

export { sequelize } from './sequelize'
export const app = express()

// compressing api response
app.use(compression())

// logger
app.use(requestLoggingMiddleware)

// cors enable
app.options('*', cors<express.Request>())
app.use(cors({ origin: 'http://localhost:5000' }))

// security config
app.use(helmet(helmetOptions))

// body-parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// all the api routes
// This must come before app.get('*') to avoid overriding API routes
const bannerMessage = bannerConfig.siteWideMessage
const googleAnalyticsId = googleAnalyticsConfig.googleAnalyticsId
const jwtSecret = authConfig.jwtSecret
const fullStoryOrgId = fullStoryConfig.fullStoryOrgId

const mailOptions = {
  ...mailConfig.smtpConfig,
  ignoreTLS: baseConfig.nodeEnv !== Environment.Prod,
}

const authService = new AuthService({ emailValidator, jwtSecret })
const authMiddleware = new AuthMiddleware({ jwtSecret })
const mailService = new MailService({
  mailOptions,
  mailFromEmail: mailConfig.senderConfig.mailFrom,
})

const apiOptions = {
  agency: new AgencyController({ agencyService: new AgencyService() }),
  answers: {
    controller: new AnswersController({
      authService,
      answersService: new AnswersService(),
    }),
    authMiddleware: authMiddleware,
  },
  auth: {
    controller: new AuthController({
      mailService,
      authService,
      userService: new UserService({
        jwtSecret,
      }),
    }),
    middleware: authMiddleware,
  },
  env: new EnvController({ bannerMessage, googleAnalyticsId, fullStoryOrgId }),
  post: {
    controller: new PostController({
      authService,
      postService: new PostService(),
    }),
    authMiddleware: authMiddleware,
  },
  tags: {
    controller: new TagsController({
      authService,
      tagsService: new TagsService(),
    }),
    authMiddleware: authMiddleware,
  },
}

app.use('/api/v1', api(apiOptions))

// connection with client setup
if (baseConfig.nodeEnv === Environment.Prod) {
  app.use(
    express.static(path.resolve(__dirname, '../../..', 'client', 'build')),
  )

  app.get('*', (_req, res) => {
    res.sendFile(
      path.resolve(__dirname, '../../..', 'client', 'build', 'index.html'),
    )
  })
}

export default app

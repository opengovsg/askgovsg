import axios from 'axios'
import compression from 'compression'
import connectDatadog from 'connect-datadog'
import cors from 'cors'
import express from 'express'
import fs from 'fs'
import helmet from 'helmet'
import { StatsD } from 'hot-shots'
import { StatusCodes } from 'http-status-codes'
import { createTransport } from 'nodemailer'
import path from 'path'
import { AgencyController } from '../modules/agency/agency.controller'
import { AgencyService } from '../modules/agency/agency.service'
import { AnswersController } from '../modules/answers/answers.controller'
import { AnswersService } from '../modules/answers/answers.service'
import { AuthController } from '../modules/auth/auth.controller'
import { AuthMiddleware } from '../modules/auth/auth.middleware'
import { AuthService } from '../modules/auth/auth.service'
import { EnquiryController } from '../modules/enquiry/enquiry.controller'
import { EnquiryService } from '../modules/enquiry/enquiry.service'
import { EnvController } from '../modules/environment/env.controller'
import { FileController } from '../modules/file/file.controller'
import { FileService } from '../modules/file/file.service'
import { MailService } from '../modules/mail/mail.service'
import { PostController } from '../modules/post/post.controller'
import { PostService } from '../modules/post/post.service'
import { TagsController } from '../modules/tags/tags.controller'
import { TagsService } from '../modules/tags/tags.service'
import { TopicsController } from '../modules/topics/topics.controller'
import { TopicsService } from '../modules/topics/topics.service'
import { UserService } from '../modules/user/user.service'
import { WebController } from '../modules/web/web.controller'
import { routeWeb } from '../modules/web/web.routes'
import { WebService } from '../modules/web/web.service'
import { api } from '../routes'
import { RecaptchaService } from '../services/recaptcha/recaptcha.service'
import { bannerConfig } from './config/banner'
import { baseConfig, Environment } from './config/base'
import { datadogConfig } from './config/datadog'
import { fileConfig } from './config/file'
import { fullStoryConfig } from './config/fullstory'
import { googleAnalyticsConfig } from './config/googleAnalytics'
import { mailConfig } from './config/mail'
import { recaptchaConfig } from './config/recaptcha'
import { emailValidator } from './email-validator'
import { helmetOptions } from './helmet-options'
import { createLogger } from './logging'
import { requestLoggingMiddleware } from './logging/request-logging'
import { passportConfig } from './passport'
import { bucket, host, s3 } from './s3'
import {
  Agency,
  Answer,
  Permission,
  Post,
  PostTag,
  sequelize,
  Tag,
  Token,
  User,
  Topic,
} from './sequelize'
import sessionMiddleware from './session'

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
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// passport and session
app.set('trust proxy', 1) // trust first proxy
app.use(sessionMiddleware(sequelize))
passportConfig(app, Token, User)

// all the api routes
// This must come before app.get('*') to avoid overriding API routes
const bannerMessage = bannerConfig.siteWideMessage
const googleAnalyticsId = googleAnalyticsConfig.googleAnalyticsId
const fullStoryOrgId = fullStoryConfig.fullStoryOrgId

const mailOptions = {
  ...mailConfig.smtpConfig,
  ignoreTLS: baseConfig.nodeEnv !== Environment.Prod,
}
const transport = createTransport(mailOptions)

const agencyService = new AgencyService({ Agency })
const authService = new AuthService({
  emailValidator,
  User,
  Permission,
  Post,
  Topic,
})
const authMiddleware = new AuthMiddleware()
const mailService = new MailService({
  transport,
  mailFromEmail: mailConfig.senderConfig.mailFrom,
})
const postService = new PostService({ Answer, Post, PostTag, Tag, User })
const enquiryService = new EnquiryService({ Agency, mailService })
const recaptchaService = new RecaptchaService({ axios, ...recaptchaConfig })
const answersService = new AnswersService()
const topicsService = new TopicsService({ Topic })
const userService = new UserService({ User, Tag, Agency })

const apiOptions = {
  agency: {
    controller: new AgencyController({ agencyService }),
    topicsController: new TopicsController({ topicsService, authService }),
  },
  answers: {
    controller: new AnswersController({
      authService,
      answersService,
    }),
    authMiddleware,
  },
  auth: {
    controller: new AuthController({
      mailService,
      authService,
      userService,
      Token,
    }),
    authMiddleware,
  },
  env: new EnvController({ bannerMessage, googleAnalyticsId, fullStoryOrgId }),
  post: {
    controller: new PostController({
      authService,
      postService,
      userService,
    }),
    authMiddleware,
  },
  tags: {
    controller: new TagsController({
      authService,
      tagsService: new TagsService(),
    }),
    authMiddleware,
  },
  topics: {
    controller: new TopicsController({
      topicsService,
      authService,
    }),
    authMiddleware,
  },
  file: {
    controller: new FileController({
      fileService: new FileService({ s3, bucket, host }),
    }),
    authMiddleware,
    maxFileSize: fileConfig.maxFileSize,
  },
  enquiries: new EnquiryController({ enquiryService, recaptchaService }),
}

const index = fs.readFileSync(
  path.resolve(__dirname, '../../..', 'client', 'build', 'index.html'),
)

const webController = new WebController({
  agencyService,
  answersService,
  postService,
  webService: new WebService(),
  index,
})

const moduleLogger = createLogger(module)

if (baseConfig.nodeEnv === Environment.Prod) {
  app.use(
    connectDatadog({
      response_code: true,
      tags: [`service:${datadogConfig.service}`, `env:${datadogConfig.env}`],
      path: false,
      dogstatsd: new StatsD({
        useDefaultRoute: true,
        errorHandler: (error) => {
          moduleLogger.error({
            message: error.message,
            meta: {
              function: 'Datadog',
            },
            error,
          })
        },
      }),
    }),
  )
}

app.use('/api/v1', api(apiOptions))

// connection with client setup
if (baseConfig.nodeEnv === Environment.Prod) {
  app.use(
    express.static(path.resolve(__dirname, '../../..', 'client', 'build')),
  )

  app.use('/', routeWeb({ controller: webController }))

  // iterate through list of possible paths to serve index file
  const allStaticPaths = [
    '/',
    '/questions',
    '/login',
    '/add/question',
    '/edit/question/:id',
    '/terms',
    '/agency-terms',
    '/privacy',
    '/agency-privacy',
  ]
  for (const path of allStaticPaths) {
    app.get(path, (_req, res) =>
      res.header('content-type', 'text/html').send(index),
    )
  }

  app.get('/not-found', (_req, res) =>
    res
      .header('content-type', 'text/html')
      .status(StatusCodes.NOT_FOUND)
      .send(index),
  )

  app.get('*', (_req, res) =>
    res.header('content-type', 'text/html').redirect('/not-found'),
  )
}

export default app

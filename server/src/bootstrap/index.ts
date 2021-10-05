import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import fs from 'fs'
import path from 'path'
import axios from 'axios'

import connectDatadog from 'connect-datadog'
import { StatsD } from 'hot-shots'

import express from 'express'

import { createTransport } from 'nodemailer'

import { api } from '../routes'
import { EnvController } from '../modules/environment/env.controller'
import { AgencyController } from '../modules/agency/agency.controller'
import { AnswersController } from '../modules/answers/answers.controller'
import { PostController } from '../modules/post/post.controller'
import { AuthController } from '../modules/auth/auth.controller'
import { TagsController } from '../modules/tags/tags.controller'
import { MailService } from '../modules/mail/mail.service'
import { EnquiryController } from '../modules/enquiry/enquiry.controller'
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
import { fullStoryConfig } from './config/fullstory'
import { mailConfig } from './config/mail'
import { fileConfig } from './config/file'
import { recaptchaConfig } from './config/recaptcha'
import { createLogger } from './logging'
import { requestLoggingMiddleware } from './logging/request-logging'

import { helmetOptions } from './helmet-options'
import { emailValidator } from './email-validator'
import { EnquiryService } from '../modules/enquiry/enquiry.service'
import {
  Agency,
  Answer,
  Permission,
  Post,
  PostTag,
  Tag,
  User,
  Token,
  sequelize,
} from './sequelize'
import { RecaptchaService } from '../services/recaptcha/recaptcha.service'

import { s3, bucket, host } from './s3'
import { FileController } from '../modules/file/file.controller'
import { FileService } from '../modules/file/file.service'
import { datadogConfig } from './config/datadog'

import { passportConfig } from './passport'
import sessionMiddleware from './session'

import cheerio from 'cheerio'
import sanitizeHtml from 'sanitize-html'

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
  PostTag,
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

const apiOptions = {
  agency: new AgencyController({ agencyService }),
  answers: {
    controller: new AnswersController({
      authService,
      answersService: answersService,
    }),
    authMiddleware,
  },
  auth: {
    controller: new AuthController({
      mailService,
      authService,
      userService: new UserService(),
      Token,
    }),
    authMiddleware,
  },
  env: new EnvController({ bannerMessage, googleAnalyticsId, fullStoryOrgId }),
  post: {
    controller: new PostController({
      authService,
      postService: postService,
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
  file: {
    controller: new FileController({
      fileService: new FileService({ s3, bucket, host }),
    }),
    authMiddleware,
    maxFileSize: fileConfig.maxFileSize,
  },
  enquiries: new EnquiryController({ enquiryService, recaptchaService }),
}

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

  const index = fs.readFileSync(
    path.resolve(__dirname, '../../..', 'client', 'build', 'index.html'),
  )

  app.get('/agency/:shortname', (req, res) => {
    const $ = cheerio.load(index)

    $('title').text(`${req.params.shortname.toUpperCase()} FAQ - AskGov`)
    $('meta[property="og:title"]').attr(
      'content',
      `${req.params.shortname.toUpperCase()} FAQ - AskGov`,
    )
    $('meta[property="og:url"]').attr('content', `${req.url.toLowerCase()}`)

    const agencyPromise = async () => {
      return await agencyService.findOneByName({
        shortname: req.params.shortname,
      })
    }
    ;(async () => {
      const agency = await agencyPromise()
      if (agency.isOk()) {
        $('meta[name="description"]').attr(
          'content',
          `Answers from ${
            agency.value.longname
          } (${req.params.shortname.toUpperCase()})`,
        )
        $('meta[property="og:description"]').attr(
          'content',
          `Answers from ${
            agency.value.longname
          } (${req.params.shortname.toUpperCase()})`,
        )
      } else {
        $('meta[name="description"]').attr(
          'content',
          `Answers from ${req.params.shortname.toUpperCase()}`,
        )
        $('meta[property="og:description"]').attr(
          'content',
          `Answers from ${req.params.shortname.toUpperCase()}`,
        )
      }
      res.header('content-type', 'text/html').send($.html())
    })()
  })

  app.get('/questions/:id', (req, res) => {
    const $ = cheerio.load(index)

    $('meta[property="og:type"]').attr('content', 'article')
    $('meta[property="og:url"]').attr('content', `${req.url.toLowerCase()}`)

    const postId: number = +req.params.id
    const postPromise = async () => {
      return await postService.getSinglePost(postId)
    }
    const answersPromise = async () => {
      return await answersService.listAnswers(postId)
    }
    ;(async () => {
      const post = await postPromise()
      $('title').text(`${post.title} - AskGov`)
      $('meta[property="og:title"]').attr('content', `${post.title} - AskGov`)
      const answers = await answersPromise()
      if (answers && answers.length > 0) {
        const answerBody = sanitizeHtml(answers[0].body, {
          allowedTags: [],
          allowedAttributes: {},
        })
        $('meta[name="description"]').attr('content', `${answerBody}`)
        $('meta[property="og:description"]').attr('content', `${answerBody}`)
      } else {
        $('meta[name="description"]').attr('content', `${post.description}`)
        $('meta[property="og:description"]').attr(
          'content',
          `${post.description}`,
        )
      }
      res.header('content-type', 'text/html').send($.html())
    })()
  })

  app.get('*', (req, res) => {
    const $ = cheerio.load(index)
    $('meta[property="og:url"]').attr('content', `${req.url.toLowerCase()}`)
    res.header('content-type', 'text/html').send($.html())
  })
}

export default app

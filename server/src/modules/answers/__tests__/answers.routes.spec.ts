import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { Model, Sequelize } from 'sequelize'
import { checkOwnershipUsing } from '../../../middleware/checkOwnership'
import supertest from 'supertest'
import {
  Agency,
  Answer,
  Post,
  PostStatus,
  Topic,
  User,
} from '~shared/types/base'
import { PostCreation } from '../../../models/posts.model'
import { ControllerHandler } from '../../../types/response-handler'
import { Creation, ModelDef } from '../../../types/sequelize'
import {
  createTestDatabase,
  getModelDef,
  ModelName,
} from '../../../util/jest-db'
import { AnswersController } from '../answers.controller'
import { routeAnswers } from '../answers.routes'
import { AnswersService } from '../answers.service'
import { okAsync } from 'neverthrow'
import { UserAuthType } from '~shared/types/api'

describe('/answers', () => {
  let agency: Agency
  let topic: Topic
  let user: User
  let post: Post
  let answer: Model<Answer, Creation<Answer>> & Answer

  let db: Sequelize
  let Post: ModelDef<Post, PostCreation>
  let Answer: ModelDef<Answer>

  const authService = {
    hasPermissionToAnswer: jest.fn(),
  }

  // Set up auth middleware to inject user
  let authUser: Express.User | undefined = undefined
  const authenticate: ControllerHandler = (req, _res, next) => {
    req.user = authUser
    next()
  }

  const app = express()
  const request = supertest(app)

  const searchSyncService = {
    createPost: jest.fn(),
    updatePost: jest.fn(),
  }

  beforeAll(async () => {
    db = await createTestDatabase()
    Post = getModelDef<Post, PostCreation>(db, ModelName.Post)
    Answer = getModelDef<Answer>(db, ModelName.Answer)
    const User = getModelDef<User>(db, ModelName.User)
    const Agency = getModelDef<Agency>(db, ModelName.Agency)

    const answersService = new AnswersService({
      Post,
      Answer,
      searchSyncService,
      sequelize: db,
    })
    const controller = new AnswersController({
      answersService,
      authService,
    })

    const checkOwnership = checkOwnershipUsing({ Post, User, Answer })

    app.use(express.json())
    app.use(
      routeAnswers({
        controller,
        authMiddleware: { authenticate },
        checkOwnership,
      }),
    )
    agency = await Agency.create({
      shortname: 'was',
      longname: 'Work Allocation Singapore',
      email: 'enquiries@was.gov.sg',
      logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
      noEnquiriesMessage: null,
      website: null,
      displayOrder: null,
    })

    user = await User.create({
      username: 'enquiries@was.gov.sg',
      displayname: 'Enquiries @ WAS',
      views: 0,
      agencyId: agency.id,
    })
    await User.update({ id: 1 }, { where: { id: null } })

    const Topic = getModelDef<Topic>(db, ModelName.Topic)
    topic = await Topic.create({
      agencyId: agency.id,
      name: 'Post Topic',
      description: null,
      parentId: null,
    })
    await Topic.update({ id: 1 }, { where: { id: null } })
  })

  beforeEach(async () => {
    authUser = { id: user.id, type: UserAuthType.Agency }
    await Post.destroy({ truncate: true })
    await Answer.destroy({ truncate: true })
    post = await Post.create({
      title: 'Post',
      description: null,
      agencyId: agency.id,
      userId: user.id,
      topicId: topic.id,
      status: PostStatus.Private,
    })
    answer = await Answer.create({
      body: 'Answer Body',
      userId: user.id,
      postId: post.id,
    })
    jest.resetAllMocks()
    authService.hasPermissionToAnswer.mockResolvedValue(true)
  })

  describe('GET /:id', () => {
    it('returns OK on valid query', async () => {
      const answers = [
        {
          ...answer.toJSON(),
          createdAt: (answer.createdAt as Date).toISOString(),
          updatedAt: (answer.updatedAt as Date).toISOString(),
        },
      ]
      const response = await request.get(`/${post.id}`)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(answers)
    })
  })

  describe('POST /:id', () => {
    it('returns UNAUTHORIZED on no user', async () => {
      authUser = undefined

      const response = await request
        .post(`/${post.id}`)
        .send({ text: answer.body })

      expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(response.body).toStrictEqual({ message: 'User not signed in' })
    })

    it('returns FORBIDDEN on no user', async () => {
      authService.hasPermissionToAnswer.mockResolvedValue(false)

      const response = await request
        .post(`/${post.id}`)
        .send({ text: answer.body })

      expect(response.status).toEqual(StatusCodes.FORBIDDEN)
      expect(response.body).toStrictEqual({
        message: 'You do not have permissions to answer question',
      })
    })

    it('returns OK on valid submission', async () => {
      const { id, body: text } = answer
      await Answer.destroy({ where: { id } })

      searchSyncService.updatePost.mockResolvedValue(okAsync({}))

      const response = await request.post(`/${post.id}`).send({ text })

      const newAnswerId = Number(response.body)
      const newAnswer = await Answer.findByPk(newAnswerId)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(newAnswer?.body).toStrictEqual(text)
      expect(newAnswer?.id).not.toBe(id)
    })
  })

  describe('PUT /:id', () => {
    it('returns OK on valid submission', async () => {
      const text = 'Second Answer Body'
      searchSyncService.updatePost.mockResolvedValue(okAsync({}))

      const response = await request.put(`/${answer.id}`).send({ text })

      const updatedAnswer = await Answer.findByPk(answer.id)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(1)
      expect(updatedAnswer?.body).toStrictEqual(text)
    })
  })

  describe('DELETE /:id', () => {
    it('returns OK on valid query', async () => {
      const response = await request.delete(`/${answer.id}`)
      const deletedAnswer = await Answer.findByPk(answer.id)
      expect(response.status).toEqual(StatusCodes.OK)
      expect(deletedAnswer).toBeNull()
    })
  })
})

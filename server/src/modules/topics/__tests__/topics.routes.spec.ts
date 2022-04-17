import { Topic, Agency, User } from '~shared/types/base'
import { routeTopics } from '../topics.routes'
import { TopicsService } from '../topics.service'
import { TopicsController } from '../topics.controller'
import { ControllerHandler } from '../../../types/response-handler'
import {
  createTestDatabase,
  getModelDef,
  ModelName,
} from '../../../util/jest-db'
import { Sequelize, Model } from 'sequelize'
import { ModelDef, Creation } from '../../../types/sequelize'
import express from 'express'
import supertest from 'supertest'
import { StatusCodes } from 'http-status-codes'

describe('/topics', () => {
  const path = '/topics'

  let db: Sequelize
  let Agency: ModelDef<Agency>
  let Topic: ModelDef<Topic>
  let mockUser: User
  let mockAgency: Agency
  let mockTopic: Model<Topic, Creation<Topic>> & Topic

  let topicsService: TopicsService
  let controller: TopicsController

  // Set up service, controller and route
  const authService = {
    checkIfWhitelistedOfficer: jest.fn(),
    hasPermissionToAnswer: jest.fn(),
    verifyUserCanViewPost: jest.fn(),
    isOfficerEmail: jest.fn(),
    verifyUserCanModifyTopic: jest.fn(),
    verifyUserInAgency: jest.fn(),
  }

  const postService = {
    getExistingTagsFromRequestTags: jest.fn(),
    getExistingTopicFromRequestTopic: jest.fn(),
    getExistingTopicsFromRequestTopics: jest.fn(),
    getChildTopicsFromRequestTopics: jest.fn(),
    listPosts: jest.fn(),
    listAnswerablePosts: jest.fn(),
    getSinglePost: jest.fn(),
    createPost: jest.fn(),
    deletePost: jest.fn(),
    updatePost: jest.fn(),
    getPostsOfTopic: jest.fn(),
  }

  // Set up auth middleware to inject user
  let authUser: Express.User | undefined = undefined
  const authenticate: ControllerHandler = (req, _res, next) => {
    req.user = authUser
    next()
  }

  const authMiddleware = {
    authenticate,
  }

  beforeAll(async () => {
    db = await createTestDatabase()
    Topic = getModelDef<Topic>(db, ModelName.Topic)
    Agency = getModelDef<Agency>(db, ModelName.Agency)
    const User = getModelDef<User>(db, ModelName.User)

    topicsService = new TopicsService({ Topic })
    controller = new TopicsController({
      authService,
      topicsService,
      postService,
    })

    mockAgency = await Agency.create({
      shortname: 'was',
      longname: 'Work Allocation Singapore',
      email: 'enquiries@was.gov.sg',
      logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
      noEnquiriesMessage: null,
      website: null,
      displayOrder: null,
    })

    const mockTopicContent = {
      name: 'topic 1',
      description: 'topic 1 description',
      agencyId: mockAgency.id,
      parentId: null,
    }

    mockTopic = await Topic.create(mockTopicContent)
    mockUser = await User.create({
      username: 'enquiries@was.gov.sg',
      displayname: 'Enquiries @ WAS',
      views: 0,
      agencyId: mockAgency.id,
    })
  })

  beforeEach(async () => {
    authUser = { id: mockUser.id }
    jest.resetAllMocks()
  })

  afterAll(async () => {
    await db.close()
  })

  describe(`GET /:topicId`, () => {
    it('returns OK on valid query', async () => {
      const mockTopicRes = {
        ...mockTopic.toJSON(),
        createdAt: (mockTopic.createdAt as Date).toISOString(),
        updatedAt: (mockTopic.updatedAt as Date).toISOString(),
      }

      const router = routeTopics({ controller, authMiddleware })
      const app = express()
      app.use(authenticate)
      app.use(path, router)
      const request = supertest(app)
      const response = await request.get(path + `/${mockTopic.id}`)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(mockTopicRes)
    })

    it('returns NOT FOUND if topic does not exist', async () => {
      const badTopicId = mockTopic.id + 20

      const router = routeTopics({ controller, authMiddleware })
      const app = express()
      app.use(authenticate)
      app.use(path, router)
      const request = supertest(app)
      const response = await request.get(path + `/${badTopicId}`)

      expect(response.status).toEqual(StatusCodes.NOT_FOUND)
    })
  })

  describe(`POST /`, () => {
    const goodTopic = {
      name: 'test',
      description: 'test description',
      agencyId: 1,
      parentId: null,
    }

    beforeEach(() => {
      authService.verifyUserInAgency.mockResolvedValue(true)
    })

    it('returns OK on valid creation', async () => {
      const router = routeTopics({ controller, authMiddleware })
      const app = express()
      app.use(express.json())
      app.use(authenticate)
      app.use(path, router)
      const request = supertest(app)

      const response = await request.post(path).send(goodTopic)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toMatchObject(goodTopic)
    })

    it('returns BAD REQUEST if the name and/or description do not fulfil the character requirements', async () => {
      const router = routeTopics({ controller, authMiddleware })
      const app = express()
      app.use(express.json())
      app.use(authenticate)
      app.use(path, router)
      const request = supertest(app)

      const body = {
        name: '',
        description: 'fail',
        agencyId: mockAgency.id,
        parentId: null,
      }

      const response = await request.post(path).send(body)

      expect(response.status).toEqual(StatusCodes.BAD_REQUEST)
    })

    it('returns UNAUTHORISED on no user', async () => {
      authUser = undefined

      const router = routeTopics({ controller, authMiddleware })
      const app = express()
      app.use(express.json())
      app.use(authenticate)
      app.use(path, router)
      const request = supertest(app)

      const response = await request.post(path).send(goodTopic)

      expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(response.body).toStrictEqual({ message: 'User not signed in' })
    })

    it('returns FORBIDDEN if user has no permission', async () => {
      authService.verifyUserInAgency.mockResolvedValue(false)

      const router = routeTopics({ controller, authMiddleware })
      const app = express()
      app.use(express.json())
      app.use(authenticate)
      app.use(path, router)
      const request = supertest(app)

      const response = await request.post(path).send(goodTopic)

      expect(response.status).toEqual(StatusCodes.FORBIDDEN)
      expect(response.body).toStrictEqual({
        message: 'You do not have permission to create this topic',
      })
    })
  })

  describe(`PUT /:id`, () => {
    const body = {
      name: 'test update',
      description: 'test description',
      agencyId: 1,
      parentId: null,
    }

    beforeEach(() => {
      authService.verifyUserCanModifyTopic.mockResolvedValue(true)
    })
    it('returns 200 if topic is updated successfully', async () => {
      const router = routeTopics({ controller, authMiddleware })
      const app = express()
      app.use(express.json())
      app.use(authenticate)
      app.use(path, router)
      const request = supertest(app)

      const response = await request.put(path + `/${mockTopic.id}`).send(body)
      const topic = await Topic.findByPk(mockTopic.id)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(topic?.name).toStrictEqual(body.name)
    })

    it('returns BAD REQUEST if the name and/or description do not fulfil the character requirements', async () => {
      const router = routeTopics({ controller, authMiddleware })
      const app = express()
      app.use(express.json())
      app.use(authenticate)
      app.use(path, router)
      const request = supertest(app)

      const badTopic = {
        name: '',
        description: 'fail',
        agencyId: mockAgency.id,
        parentId: null,
      }

      const response = await request
        .put(path + `/${mockTopic.id}`)
        .send(badTopic)

      expect(response.status).toEqual(StatusCodes.BAD_REQUEST)
    })

    it('returns UNAUTHORISED on no user', async () => {
      authUser = undefined

      const router = routeTopics({ controller, authMiddleware })
      const app = express()
      app.use(express.json())
      app.use(authenticate)
      app.use(path, router)
      const request = supertest(app)

      const response = await request.put(path + `/${mockTopic.id}`).send(body)

      expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(response.body).toStrictEqual({ message: 'User not signed in' })
    })

    it('returns FORBIDDEN if user has no permission', async () => {
      authService.verifyUserCanModifyTopic.mockResolvedValue(false)

      const router = routeTopics({ controller, authMiddleware })
      const app = express()
      app.use(express.json())
      app.use(authenticate)
      app.use(path, router)
      const request = supertest(app)

      const response = await request.put(path + `/${mockTopic.id}`).send(body)

      expect(response.status).toEqual(StatusCodes.FORBIDDEN)
      expect(response.body).toStrictEqual({
        message: 'You do not have permission to update this topic',
      })
    })
  })

  describe(`DELETE /:id`, () => {
    beforeEach(() => {
      authService.verifyUserCanModifyTopic.mockResolvedValue(true)
    })
    it('returns 200 if topic is deleted successfully', async () => {
      postService.getPostsOfTopic.mockResolvedValue({
        posts: [],
        totalItems: 0,
      })
      const router = routeTopics({ controller, authMiddleware })
      const app = express()
      app.use(express.json())
      app.use(authenticate)
      app.use(path, router)
      const request = supertest(app)

      const response = await request.delete(path + `/${mockTopic.id}`)
      const deletedTopic = await Topic.findByPk(mockTopic.id)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(deletedTopic).toBeNull()
    })

    it('returns UNAUTHORISED on no user', async () => {
      authUser = undefined

      const router = routeTopics({ controller, authMiddleware })
      const app = express()
      app.use(express.json())
      app.use(authenticate)
      app.use(path, router)
      const request = supertest(app)

      const response = await request.delete(path + `/${mockTopic.id}`)

      expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(response.body).toStrictEqual({ message: 'User not signed in' })
    })

    it('returns FORBIDDEN if user has no permission', async () => {
      authService.verifyUserCanModifyTopic.mockResolvedValue(false)

      const router = routeTopics({ controller, authMiddleware })
      const app = express()
      app.use(express.json())
      app.use(authenticate)
      app.use(path, router)
      const request = supertest(app)

      const response = await request.delete(path + `/${mockTopic.id}`)

      expect(response.status).toEqual(StatusCodes.FORBIDDEN)
      expect(response.body).toStrictEqual({
        message: 'You do not have permission to delete this topic',
      })
    })
  })
})

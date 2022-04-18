import express from 'express'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { TopicsController } from '../topics.controller'
import { ControllerHandler } from '../../../types/response-handler'
import { errAsync, okAsync } from 'neverthrow'
import { MissingTopicError } from '../topics.errors'
import { DatabaseError } from '../../core/core.errors'

describe('TopicsController', () => {
  const path = '/topics'
  const authService = {
    checkIfWhitelistedOfficer: jest.fn(),
    hasPermissionToAnswer: jest.fn(),
    verifyUserCanViewPost: jest.fn(),
    isOfficerEmail: jest.fn(),
    verifyUserCanModifyTopic: jest.fn(),
    verifyUserInAgency: jest.fn(),
  }

  const topicsService = {
    findOneById: jest.fn(),
    listTopicsUsedByAgency: jest.fn(),
    createTopic: jest.fn(),
    deleteTopicById: jest.fn(),
    updateTopicById: jest.fn(),
    listTopics: jest.fn(),
    getTopicById: jest.fn(),
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
    getPostsByTopic: jest.fn(),
  }

  const topicsController = new TopicsController({
    authService,
    topicsService,
    postService,
  })

  // Set up auth middleware to inject user
  let user: Express.User | undefined = { id: 1 }
  const middleware: ControllerHandler = (req, res, next) => {
    req.user = user
    next()
  }

  const noErrors: { errors: () => { msg: string }[] }[] = []
  let errors: { errors: () => { msg: string }[] }[] = noErrors
  const invalidateIfHasErrors: ControllerHandler = (req, _res, next) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req['express-validator#contexts'] = errors
    next()
  }

  const mockAgency = {
    id: 1,
    shortname: 'was',
    longname: 'Work Allocation Singapore',
    email: 'enquiries@was.gov.sg',
    logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
  }

  const mockTopicId = 1
  const mockTopic = {
    name: '1',
    description: '',
    agencyId: 1,
    parentId: null,
  }

  beforeEach(() => {
    user = { id: 1 }
    jest.resetAllMocks()
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('getTopicById', () => {
    const app = express()
    app.use(express.json())
    app.use(middleware)
    app.get(path + '/:topicId', topicsController.getTopicById)
    const request = supertest(app)

    it('returns OK on valid query', async () => {
      topicsService.getTopicById.mockReturnValue(okAsync(mockTopic))
      const response = await request.get(path + `/${mockTopicId}`)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(mockTopic)
      expect(topicsService.getTopicById).toHaveBeenCalledWith(mockTopicId)
    })
  })

  describe('listTopicsUsedByAgency', () => {
    const app = express()
    app.use(express.json())
    app.use(middleware)
    app.get(
      '/agencies/:agencyId/topics',
      topicsController.listTopicsUsedByAgency,
    )
    const request = supertest(app)

    it('should return 200 on successful data retrieval', async () => {
      const agencyId = mockAgency.id
      topicsService.listTopicsUsedByAgency.mockReturnValue(okAsync(mockTopic))

      const response = await request.get(`/agencies/${agencyId}/topics`)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(mockTopic)
      expect(topicsService.listTopicsUsedByAgency).toHaveBeenCalledWith(
        agencyId,
      )
    })

    it('returns NOT_FOUND on invalid query', async () => {
      const agencyId = mockAgency.id

      topicsService.listTopicsUsedByAgency.mockReturnValue(
        errAsync(new MissingTopicError()),
      )

      const response = await request.get(`/agencies/${agencyId}/topics`)

      expect(response.status).toEqual(StatusCodes.NOT_FOUND)
      expect(response.body).toStrictEqual({ message: 'Topic not found' })
      expect(topicsService.listTopicsUsedByAgency).toHaveBeenCalledWith(
        agencyId,
      )
    })

    it('returns INTERNAL_SERVER_ERROR', async () => {
      const agencyId = mockAgency.id

      topicsService.listTopicsUsedByAgency.mockReturnValue(
        errAsync(new DatabaseError()),
      )

      const response = await request.get(`/agencies/${agencyId}/topics`)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(topicsService.listTopicsUsedByAgency).toHaveBeenCalledWith(
        agencyId,
      )
    })
  })

  describe('createTopic', () => {
    beforeEach(() => {
      authService.hasPermissionToAnswer.mockReset()
      topicsService.createTopic.mockReset()
      errors = noErrors
    })
    it('returns 401 on no user', async () => {
      user = undefined

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.post(path, topicsController.createTopic)
      const request = supertest(app)

      const response = await request.post(path)

      expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(response.body).toStrictEqual({
        message: 'User not signed in',
      })
      expect(topicsService.createTopic).not.toHaveBeenCalled()
    })
    it('returns 403 on user from a different agency', async () => {
      authService.verifyUserInAgency.mockResolvedValue(false)

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.post(path, topicsController.createTopic)
      const request = supertest(app)

      const response = await request.post(path)
      expect(response.status).toEqual(StatusCodes.FORBIDDEN)
      expect(response.body).toStrictEqual({
        message: 'You do not have permission to create this topic',
      })
      expect(topicsService.createTopic).not.toHaveBeenCalled()
    })
    it('returns 400 on bad request', async () => {
      authService.verifyUserInAgency.mockResolvedValue(true)

      errors = [
        {
          errors: () => [
            {
              msg: 'Validation Error',
            },
          ],
        },
      ]

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.post(path, topicsController.createTopic)
      const request = supertest(app)

      const response = await request.post(path).send(mockTopic)

      expect(response.status).toEqual(StatusCodes.BAD_REQUEST)
      expect(topicsService.createTopic).not.toHaveBeenCalled()
    })
    it('returns 500 on topicsService problem', async () => {
      authService.verifyUserInAgency.mockResolvedValue(true)
      topicsService.createTopic.mockReturnValue(errAsync(new DatabaseError()))

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.post(path, topicsController.createTopic)
      const request = supertest(app)

      const response = await request.post(path).send(mockTopic)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(topicsService.createTopic).toHaveBeenCalledWith(mockTopic)
    })
    it('returns 200 on successful creation', async () => {
      authService.verifyUserInAgency.mockResolvedValue(true)
      topicsService.createTopic.mockReturnValue(okAsync(mockTopic))
      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.post(path, topicsController.createTopic)
      const request = supertest(app)

      const response = await request.post(path).send(mockTopic)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(mockTopic)
    })
  })

  describe('updateTopic', () => {
    const updateTopic = {
      id: mockTopicId,
      name: mockTopic.name,
      description: mockTopic.description,
      parentId: mockTopic.parentId,
    }

    beforeEach(() => {
      authService.hasPermissionToAnswer.mockReset()
      topicsService.updateTopicById.mockReset()
      topicsService.updateTopicById.mockReturnValue(okAsync(1))
      errors = noErrors
    })

    it('returns 401 on no user', async () => {
      user = undefined

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.put(path + '/:id', topicsController.updateTopic)
      const request = supertest(app)

      const response = await request
        .put(path + `/${mockTopicId}`)
        .send(updateTopic)

      expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(response.body).toStrictEqual({
        message: 'User not signed in',
      })
      expect(topicsService.updateTopicById).not.toHaveBeenCalled()
    })
    it('returns 403 on user from a different agency', async () => {
      authService.verifyUserInAgency.mockResolvedValue(false)

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.put(path + '/:id', topicsController.updateTopic)
      const request = supertest(app)

      const response = await request
        .put(path + `/${mockTopicId}`)
        .send(updateTopic)

      expect(response.status).toEqual(StatusCodes.FORBIDDEN)
      expect(response.body).toStrictEqual({
        message: 'You do not have permission to update this topic',
      })
      expect(topicsService.updateTopicById).not.toHaveBeenCalled()
    })
    it('returns 400 on bad request', async () => {
      authService.verifyUserInAgency.mockResolvedValue(true)

      errors = [
        {
          errors: () => [
            {
              msg: 'Validation Error',
            },
          ],
        },
      ]

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.put(path + '/:id', topicsController.updateTopic)
      const request = supertest(app)

      const response = await request
        .put(path + `/${mockTopicId}`)
        .send(updateTopic)

      expect(response.status).toEqual(StatusCodes.BAD_REQUEST)
      expect(topicsService.updateTopicById).not.toHaveBeenCalled()
    })
    it('returns 500 on topicsService problem', async () => {
      authService.verifyUserCanModifyTopic.mockResolvedValue(true)
      topicsService.updateTopicById.mockReturnValue(
        errAsync(new DatabaseError()),
      )
      postService.getPostsByTopic.mockResolvedValue({
        posts: [],
        totalItems: 0,
      })

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.put(path + '/:id', topicsController.updateTopic)
      const request = supertest(app)

      const response = await request
        .put(path + `/${mockTopicId}`)
        .send(updateTopic)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(topicsService.updateTopicById).toHaveBeenCalledWith(updateTopic)
    })
    it('returns 200 on successful update', async () => {
      authService.verifyUserCanModifyTopic.mockResolvedValue(true)

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.put(path + '/:id', topicsController.updateTopic)
      const request = supertest(app)

      const response = await request
        .put(path + `/${mockTopicId}`)
        .send(updateTopic)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual({
        message: 'Topic updated',
      })
      expect(topicsService.updateTopicById).toHaveBeenCalledWith(updateTopic)
    })
  })

  describe('deleteTopic', () => {
    beforeEach(() => {
      authService.hasPermissionToAnswer.mockReset()
      topicsService.deleteTopicById.mockReset()
      topicsService.deleteTopicById.mockReturnValue(okAsync(1))
      errors = noErrors
    })

    it('returns 401 on no user', async () => {
      user = undefined

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.delete(path + '/:id', topicsController.deleteTopic)
      const request = supertest(app)

      const response = await request.delete(path + `/${mockTopicId}`)

      expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(response.body).toStrictEqual({
        message: 'User not signed in',
      })
      expect(topicsService.deleteTopicById).not.toHaveBeenCalled()
    })
    it('returns 403 on user from a different agency', async () => {
      authService.verifyUserInAgency.mockResolvedValue(false)

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.delete(path + '/:id', topicsController.deleteTopic)
      const request = supertest(app)

      const response = await request.delete(path + `/${mockTopicId}`)

      expect(response.status).toEqual(StatusCodes.FORBIDDEN)
      expect(response.body).toStrictEqual({
        message: 'You do not have permission to delete this topic',
      })
      expect(topicsService.deleteTopicById).not.toHaveBeenCalled()
    })
    it('returns 403 on topic that still has posts', async () => {
      authService.verifyUserCanModifyTopic.mockResolvedValue(true)
      const data = { rows: ['1', '2'], totalItems: 1 }
      postService.getPostsByTopic.mockResolvedValue(data)

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.delete(path + '/:id', topicsController.deleteTopic)
      const request = supertest(app)

      const response = await request.delete(path + `/${mockTopicId}`)

      expect(response.status).toEqual(StatusCodes.FORBIDDEN)
      expect(response.body).toStrictEqual({
        message: 'You cannot delete a topic that has posts',
      })
      expect(topicsService.deleteTopicById).not.toHaveBeenCalled()
    })
    it('returns 500 on topicsService problem', async () => {
      authService.verifyUserCanModifyTopic.mockResolvedValue(true)
      topicsService.deleteTopicById.mockReturnValue(
        errAsync(new DatabaseError()),
      )
      postService.getPostsByTopic.mockResolvedValue({
        posts: [],
        totalItems: 0,
      })

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.delete(path + '/:id', topicsController.deleteTopic)
      const request = supertest(app)

      const response = await request.delete(path + `/${mockTopicId}`)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(topicsService.deleteTopicById).toHaveBeenCalledWith(mockTopicId)
    })
    it('returns 200 on successful deletion', async () => {
      authService.verifyUserCanModifyTopic.mockResolvedValue(true)
      postService.getPostsByTopic.mockResolvedValue({
        posts: [],
        totalItems: 0,
      })

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.use(invalidateIfHasErrors)
      app.delete(path + '/:id', topicsController.deleteTopic)
      const request = supertest(app)

      const response = await request.delete(path + `/${mockTopicId}`)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual({
        message: 'OK',
      })
      expect(topicsService.deleteTopicById).toHaveBeenCalledWith(mockTopicId)
    })
  })
})

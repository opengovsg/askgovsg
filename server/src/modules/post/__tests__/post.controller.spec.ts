import express from 'express'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { ControllerHandler } from '../../../types/response-handler'
import { PostController } from '../post.controller'

describe('PostController', () => {
  const path = '/posts'
  const authService = {
    checkIfWhitelistedOfficer: jest.fn(),
    hasPermissionToAnswer: jest.fn(),
    verifyUserCanViewPost: jest.fn(),
    isOfficerEmail: jest.fn(),
    verifyUserCanModifyTopic: jest.fn(),
    verifyUserInAgency: jest.fn(),
  }
  const postService = {
    listAnswerablePosts: jest.fn(),
    filterPostsWithoutAnswers: jest.fn(),
    checkOneAgency: jest.fn(),
    getExistingTagsFromRequestTags: jest.fn(),
    getExistingTopicFromRequestTopic: jest.fn(),
    getExistingTopicsFromRequestTopics: jest.fn(),
    getChildTopicsFromRequestTopics: jest.fn(),
    getChildTopicsFromSingleRequestTopic: jest.fn(),
    createPost: jest.fn(),
    deletePost: jest.fn(),
    updatePost: jest.fn(),
    getSinglePost: jest.fn(),
    listPosts: jest.fn(),
    getPostsOfTopic: jest.fn(),
  }

  const userService = {
    loadUser: jest.fn(),
    createOfficer: jest.fn(),
  }

  const controller = new PostController({
    authService,
    postService,
    userService,
  })

  // Set up auth middleware to inject user
  let user: Express.User | undefined = { id: 1 }
  const middleware: ControllerHandler = (req, res, next) => {
    req.user = user
    next()
  }

  beforeEach(() => {
    user = { id: 1 }
  })
  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('listPosts', () => {
    beforeEach(() => {
      postService.listPosts.mockReset()
    })
    it('should return 200 on successful data retrieval', async () => {
      // Arrange
      const data = { rows: ['1', '2'], totalItems: 5 }
      postService.listPosts.mockReturnValue(data)

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.get(path, controller.listPosts)
      const request = supertest(app)

      // Act
      const response = await request.get(path)

      // Assert
      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(data)
    })

    it('should return 422 on invalid tags used in request', async () => {
      // Arrange
      const error = new Error('Invalid tags used in request')
      postService.listPosts.mockImplementation(() => {
        throw error
      })

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.get(path, controller.listPosts)
      const request = supertest(app)

      // Act
      const response = await request.get(path)

      // Assert
      expect(response.status).toEqual(422)
      expect(response.body).toStrictEqual({ message: error.message })
    })

    it('should return 422 on invalid topics used in request', async () => {
      // Arrange
      const error = new Error('Invalid topics used in request')
      postService.listPosts.mockImplementation(() => {
        throw error
      })

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.get(path, controller.listPosts)
      const request = supertest(app)
      // Act
      const response = await request.get(path)

      // Assert
      expect(response.status).toEqual(422)
      expect(response.body).toStrictEqual({ message: error.message })
    })

    it('should return 500 on any other errors', async () => {
      // Arrange
      const error = new Error('Database error')
      postService.listPosts.mockImplementation(() => {
        throw error
      })

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.get(path, controller.listPosts)
      const request = supertest(app)

      // Act
      const response = await request.get(path)

      // Assert
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({ message: 'Server Error' })
    })
  })

  describe('listAnswerablePosts', () => {
    beforeEach(() => {
      postService.listAnswerablePosts.mockReset()
    })
    it('should return 200 on successful data retrieval', async () => {
      // Arrange
      const data = { rows: ['1', '2'], totalItems: 5 }
      postService.listAnswerablePosts.mockReturnValue(data)

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.get(path + '/answerable', controller.listAnswerablePosts)
      const request = supertest(app)
      // Act
      const response = await request.get(path + '/answerable')

      // Assert
      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(data)
    })

    it('should return 500 if userID not found', async () => {
      // Arrange
      user = undefined

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.get(path + '/answerable', controller.listAnswerablePosts)
      const request = supertest(app)

      // Act
      const response = await request.get(path + '/answerable')

      // Assert
      expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(response.body).toStrictEqual({
        message: 'User not signed in.',
      })
    })

    it('should return 422 on invalid tags used in request', async () => {
      // Arrange
      const error = new Error('Invalid tags used in request')
      postService.listAnswerablePosts.mockImplementation(() => {
        throw error
      })

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.get(path + '/answerable', controller.listAnswerablePosts)
      const request = supertest(app)
      // Act
      const response = await request.get(path + '/answerable')

      // Assert
      expect(response.status).toEqual(422)
      expect(response.body).toStrictEqual({ message: error.message })
    })

    it('should return 422 on invalid topics used in request', async () => {
      // Arrange
      const error = new Error('Invalid topics used in request')
      postService.listAnswerablePosts.mockImplementation(() => {
        throw error
      })

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.get(path + '/answerable', controller.listAnswerablePosts)
      const request = supertest(app)

      // Act
      const response = await request.get(path + '/answerable')

      // Assert
      expect(response.status).toEqual(422)
      expect(response.body).toStrictEqual({ message: error.message })
    })

    it('should return 500 on any other errors', async () => {
      // Arrange
      const error = new Error('Database error')
      postService.listAnswerablePosts.mockImplementation(() => {
        throw error
      })

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.get(path + '/answerable', controller.listAnswerablePosts)
      const request = supertest(app)

      // Act
      const response = await request.get(path + '/answerable')

      // Assert
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({
        message: 'Sorry, something went wrong. Please try again.',
      })
    })
  })

  describe('createPost', () => {
    const agencyId = 21
    const postId = 13

    beforeEach(() => {
      userService.loadUser.mockResolvedValue({ agencyId })
      postService.createPost.mockResolvedValue(postId)
    })
    it('returns 401 on no user', async () => {
      user = undefined

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.post(path, controller.createPost)
      const request = supertest(app)

      const response = await request.post(path)

      expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(response.body).toStrictEqual({
        message: 'User not signed in',
      })
      expect(postService.createPost).not.toHaveBeenCalled()
    })
    it('returns 500 on user with no agency', async () => {
      userService.loadUser.mockReturnValue({})

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.post(path, controller.createPost)
      const request = supertest(app)

      const response = await request.post(path)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({
        message: 'The current user is not associated with an agency',
      })
      expect(postService.createPost).not.toHaveBeenCalled()
    })
    it('returns 500 on userService problem', async () => {
      userService.loadUser.mockRejectedValue(new Error('bad user'))

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.post(path, controller.createPost)
      const request = supertest(app)

      const response = await request.post(path)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({
        message: 'Server error',
      })
      expect(postService.createPost).not.toHaveBeenCalled()
    })
    it('returns 500 on postService problem', async () => {
      const body = { title: 'Title', description: null, tagname: [] }
      postService.createPost.mockRejectedValue(new Error('bad post'))

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.post(path, controller.createPost)
      const request = supertest(app)

      const response = await request.post(path).send(body)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({
        message: 'Server error',
      })
      expect(postService.createPost).toHaveBeenCalledWith({
        ...body,
        userId: user?.id,
        agencyId,
      })
    })
    it('returns 200 on successful creation', async () => {
      const body = { title: 'Title', description: null, tagname: [] }

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.post(path, controller.createPost)
      const request = supertest(app)

      const response = await request.post(path).send(body)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual({ data: postId })
      expect(postService.createPost).toHaveBeenCalledWith({
        ...body,
        userId: user?.id,
        agencyId,
      })
    })
  })

  describe('deletePost', () => {
    const postId = 1

    beforeEach(() => {
      authService.hasPermissionToAnswer.mockReset()
      postService.deletePost.mockReset()
    })

    it('returns 200 on successful deletion', async () => {
      authService.hasPermissionToAnswer.mockResolvedValue(true)
      postService.deletePost.mockImplementation(() => Promise.resolve())

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.delete(path + '/:id([0-9]+$)', controller.deletePost)
      const request = supertest(app)

      const response = await request.delete(path + `/${postId}`)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual({
        message: 'OK',
      })
      expect(postService.deletePost).toHaveBeenCalledWith(postId)
    })

    it('returns 401 on no user', async () => {
      user = undefined

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.delete(path + '/:id([0-9]+$)', controller.deletePost)
      const request = supertest(app)

      const response = await request.delete(path + `/${postId}`)

      expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(response.body).toStrictEqual({
        message: 'You must be logged in to delete posts.',
      })
      expect(postService.deletePost).not.toHaveBeenCalled()
    })

    it('returns 403 if user does not have permission to delete post', async () => {
      authService.hasPermissionToAnswer.mockResolvedValue(false)

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.delete(path + '/:id([0-9]+$)', controller.deletePost)
      const request = supertest(app)

      const response = await request.delete(path + `/${postId}`)

      expect(response.status).toEqual(StatusCodes.FORBIDDEN)
      expect(response.body).toStrictEqual({
        message: 'You do not have permission to delete this post.',
      })
      expect(postService.deletePost).not.toHaveBeenCalled()
    })

    it('returns 500 on database error', async () => {
      authService.hasPermissionToAnswer.mockRejectedValue(
        new Error('Error while deleting post'),
      )

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.delete(path + '/:id([0-9]+$)', controller.deletePost)
      const request = supertest(app)

      const response = await request.delete(path + `/${postId}`)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({
        message: 'Server error',
      })
      expect(postService.deletePost).not.toHaveBeenCalled()
    })
  })

  describe('updatePost', () => {
    const userId = 1
    const postId = 1
    beforeEach(() => {
      authService.hasPermissionToAnswer.mockReset()
      postService.updatePost.mockReset()
    })

    it('returns 200 on successful update', async () => {
      authService.hasPermissionToAnswer.mockResolvedValue(true)
      postService.updatePost.mockResolvedValue(true)

      const body = {
        title: 'Title',
        description: '',
        tagname: [],
        topicId: null,
      }

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.put(path + '/:id([0-9]+$)', controller.updatePost)
      const request = supertest(app)

      const response = await request.put(path + `/${postId}`).send(body)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual({
        message: 'Answer updated',
      })
      expect(postService.updatePost).toHaveBeenCalledWith({
        ...body,
        id: postId,
        userid: userId,
      })
    })

    it('returns 401 on no user', async () => {
      user = undefined

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.put(path + '/:id([0-9]+$)', controller.updatePost)
      const request = supertest(app)

      const response = await request.put(path + `/${postId}`)

      expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(response.body).toStrictEqual({
        message: 'You must be logged in to update posts.',
      })
      expect(postService.updatePost).not.toHaveBeenCalled()
    })

    it('returns 403 if user does not have permission to update post', async () => {
      authService.hasPermissionToAnswer.mockResolvedValue(false)

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.put(path + '/:id([0-9]+$)', controller.updatePost)
      const request = supertest(app)

      const response = await request.put(path + `/${postId}`)

      expect(response.status).toEqual(StatusCodes.FORBIDDEN)
      expect(response.body).toStrictEqual({
        message: 'You do not have permission to update this post.',
      })
      expect(postService.updatePost).not.toHaveBeenCalled()
    })

    it('returns 500 on database error while determining permissions', async () => {
      authService.hasPermissionToAnswer.mockRejectedValue(
        new Error('Error while determining permissions to update post'),
      )

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.put(path + '/:id([0-9]+$)', controller.updatePost)
      const request = supertest(app)

      const response = await request.put(path + `/${postId}`)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({
        message: 'Something went wrong, please try again.',
      })
      expect(postService.updatePost).not.toHaveBeenCalled()
    })

    it('returns 500 on database error while updating post', async () => {
      authService.hasPermissionToAnswer.mockResolvedValue(true)
      postService.updatePost.mockRejectedValue(
        new Error('Answer failed to update'),
      )

      const body = {
        title: 'Title',
        description: '',
        tagname: [],
        topicId: null,
      }

      const app = express()
      app.use(express.json())
      app.use(middleware)
      app.put(path + '/:id([0-9]+$)', controller.updatePost)
      const request = supertest(app)

      const response = await request.put(path + `/${postId}`).send(body)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({
        message: 'Answer failed to update',
      })
      expect(postService.updatePost).toHaveBeenCalledWith({
        ...body,
        id: postId,
        userid: userId,
      })
    })
  })
})

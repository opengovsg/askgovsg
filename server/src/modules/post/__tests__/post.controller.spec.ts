import bodyParser from 'body-parser'
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
    getDisallowedTagsForUser: jest.fn(),
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
    createPost: jest.fn(),
    deletePost: jest.fn(),
    updatePost: jest.fn(),
    getSinglePost: jest.fn(),
    listPosts: jest.fn(),
  }

  const controller = new PostController({ authService, postService })

  // Set up auth middleware to inject user
  let user: Express.User | undefined = { id: 1 }
  const middleware: ControllerHandler = (req, res, next) => {
    req.user = user
    next()
  }

  const app = express()
  app.use(bodyParser.json())
  app.use(middleware)
  app.get(path, controller.listPosts)
  app.get(path + '/answerable', controller.listAnswerablePosts)
  const request = supertest(app)

  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('listPosts', () => {
    it('should return 200 on successful data retrieval', async () => {
      // Arrange
      const data = { rows: ['1', '2'], totalItems: 5 }
      postService.listPosts.mockReturnValue(data)

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

      // Act
      const response = await request.get(path)

      // Assert
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({ message: 'Server Error' })
    })
  })
  describe('listAnswerablePosts', () => {
    it('should return 200 on successful data retrieval', async () => {
      // Arrange
      const data = { rows: ['1', '2'], totalItems: 5 }
      postService.listAnswerablePosts.mockReturnValue(data)

      // Act
      const response = await request.get(path + '/answerable')

      // Assert
      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(data)
    })

    it('should return 500 if userID not found', async () => {
      // Arrange
      user = undefined

      // Act
      const response = await request.get(path + '/answerable')

      // Assert
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({
        message: 'Something went wrong, please try again.',
      })
    })

    it('should return 500 on any other errors', async () => {
      // Arrange
      const error = new Error('Database error')
      postService.listAnswerablePosts.mockImplementation(() => {
        throw error
      })

      // Act
      const response = await request.get(path + '/answerable')

      // Assert
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({
        message: 'Something went wrong, please try again.',
      })
    })
  })
})

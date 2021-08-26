import bodyParser from 'body-parser'
import express from 'express'
import supertest from 'supertest'
import { PostController } from '../post.controller'

describe('PostController', () => {
  const path = '/posts'
  const authService = {
    getUserIdFromToken: jest.fn(),
    getOfficerUser: jest.fn(),
    checkIfWhitelistedOfficer: jest.fn(),
    hasPermissionToAnswer: jest.fn(),
    getDisallowedTagsForUser: jest.fn(),
    verifyUserCanViewPost: jest.fn(),
    isOfficerEmail: jest.fn(),
  }
  const postService = {
    listAnswerablePosts: jest.fn(),
    filterPostsWithoutAnswers: jest.fn(),
    checkOneAgency: jest.fn(),
    getExistingTagsFromRequestTags: jest.fn(),
    createPostWithTag: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    retrieveOne: jest.fn(),
    retrieveAll: jest.fn(),
  }

  const controller = new PostController({ authService, postService })

  const app = express()
  app.use(bodyParser.json())
  app.get(path, controller.listPosts)
  app.get(path + '/answerable', controller.listAnswerablePosts)
  const request = supertest(app)
  // beforeEach(async () => {})

  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('listPosts', () => {
    it('should return 200 on successful data retrieval', async () => {
      // Arrange
      const data = { rows: ['1', '2'], totalItems: 5 }
      postService.retrieveAll.mockReturnValue(data)

      // Act
      const response = await request.get(path)

      // Assert
      expect(response.status).toEqual(200)
      expect(response.body).toStrictEqual(data)
    })

    it('should return 422 on invalid tags used in request', async () => {
      // Arrange
      const error = new Error('Invalid tags used in request')
      postService.retrieveAll.mockImplementation(() => {
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
      postService.retrieveAll.mockImplementation(() => {
        throw error
      })

      // Act
      const response = await request.get(path)

      // Assert
      expect(response.status).toEqual(500)
      expect(response.body).toStrictEqual({ message: 'Server Error' })
    })
  })
  describe('listAnswerablePosts', () => {
    it('should return 200 on successful data retrieval', async () => {
      // Arrange
      const data = { rows: ['1', '2'], totalItems: 5 }
      authService.getUserIdFromToken.mockReturnValue(123)
      postService.listAnswerablePosts.mockReturnValue(data)

      // Act
      const response = await request.get(path + '/answerable')

      // Assert
      expect(response.status).toEqual(200)
      expect(response.body).toStrictEqual(data)
    })

    it('should return 401 on unauthorized user', async () => {
      // Arrange
      authService.getUserIdFromToken.mockReturnValue(undefined)

      // Act
      const response = await request.get(path + '/answerable')

      // Assert
      expect(response.status).toEqual(401)
      expect(response.body).toStrictEqual({
        message: 'Please log in and try again',
      })
    })

    it('should return 500 on any other errors', async () => {
      // Arrange
      const error = new Error('Database error')
      authService.getUserIdFromToken.mockReturnValue(123)
      postService.listAnswerablePosts.mockImplementation(() => {
        throw error
      })

      // Act
      const response = await request.get(path + '/answerable')

      // Assert
      expect(response.status).toEqual(500)
      expect(response.body).toStrictEqual({
        message: 'Sorry, something went wrong. Please try again.',
      })
    })
  })
})

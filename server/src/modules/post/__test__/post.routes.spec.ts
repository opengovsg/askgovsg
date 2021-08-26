import bodyParser from 'body-parser'
import express from 'express'
import minimatch from 'minimatch'
import { Sequelize } from 'sequelize'
import supertest from 'supertest'
import {
  defineAnswer,
  definePostAndPostTag,
  defineTag,
  defineUserAndPermission,
} from '../../../models'
import { SortType } from '../../../types/sort-type'
import { PostController } from '../post.controller'
import { routePosts } from '../post.routes'
import { PostService } from '../post.service'

describe('/posts', () => {
  // Set up sequelize
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    username: 'username',
    logging: false,
  })
  const emailValidator = new minimatch.Minimatch('*')
  const Tag = defineTag(sequelize)
  const { User } = defineUserAndPermission(sequelize, {
    Tag,
    emailValidator,
  })
  const { Post, PostTag } = definePostAndPostTag(sequelize, { User, Tag })
  const Answer = defineAnswer(sequelize, { User, Post })
  const mockPosts = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ].map((x) => Post.build({ title: x }))
  const mockUser = User.build()
  const PostModel = jest.spyOn(Post, 'findAll').mockResolvedValue(mockPosts)
  const TagModel = jest.spyOn(Tag, 'findAll').mockResolvedValue([])
  const UserModel = jest.spyOn(User, 'findOne').mockResolvedValue(mockUser)
  const PostTagModel = jest.spyOn(PostTag, 'findAll').mockResolvedValue([])

  // Set up service, controller and route
  const postService = new PostService({ Answer, Post, PostTag, Tag, User })
  const authService = {
    getUserIdFromToken: jest.fn(),
    getOfficerUser: jest.fn(),
    checkIfWhitelistedOfficer: jest.fn(),
    hasPermissionToAnswer: jest.fn(),
    getDisallowedTagsForUser: jest.fn(),
    verifyUserCanViewPost: jest.fn(),
    isOfficerEmail: jest.fn(),
  }
  const authMiddleware = { authenticate: jest.fn() }

  const controller = new PostController({ authService, postService })

  // Set up supertest
  const path = '/posts'
  const app = express()
  app.use(bodyParser.json())
  app.use(path, routePosts({ controller, authMiddleware }))
  const request = supertest(app)

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('/posts', () => {
    it('returns 200 and data on posts on request', async () => {
      // Act
      const response = await request.get(path)

      // Assert
      expect(response.status).toEqual(200)
      expect(response.body.posts.length).toStrictEqual(mockPosts.length)
      expect(response.body.totalItems).toStrictEqual(mockPosts.length)
    })
  })

  describe('/posts/answerable', () => {
    it('returns 200 and data on posts on request', async () => {
      // Arrange
      authService.getUserIdFromToken.mockReturnValue(1)
      // Act
      const response = await request.get(path + '/answerable').query({
        withAnswers: true,
        sort: SortType.Top,
      })

      // Assert
      expect(response.status).toEqual(200)
      expect(response.body.posts.length).toStrictEqual(mockPosts.length)
      expect(response.body.totalItems).toStrictEqual(mockPosts.length)
    })
  })
})

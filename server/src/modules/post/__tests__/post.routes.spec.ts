import bodyParser from 'body-parser'
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { Sequelize } from 'sequelize'
import { ModelCtor } from 'sequelize/types'
import supertest from 'supertest'
import {
  Answer as AnswerModel,
  Permission as PermissionModel,
  Post as PostModel,
  PostTag as PostTagModel,
  Tag as TagModel,
  User as UserModel,
} from '../../../models'
import { PermissionType, PostStatus } from '../../../../../shared/types/base'
import { SortType } from '../../../types/sort-type'
import { TagType } from '../../../../../shared/types/base'
import { createTestDatabase, getModel, ModelName } from '../../../util/jest-db'
import { PostController } from '../post.controller'
import { routePosts } from '../post.routes'
import { PostService } from '../post.service'

describe('/posts', () => {
  let db: Sequelize
  let Answer: ModelCtor<AnswerModel>
  let Post: ModelCtor<PostModel>
  let PostTag: ModelCtor<PostTagModel>
  let Tag: ModelCtor<TagModel>
  let User: ModelCtor<UserModel>
  let Permission: ModelCtor<PermissionModel>

  let postService: PostService
  let controller: PostController

  const mockPosts: PostModel[] = []
  let mockUser: UserModel
  let mockTag: TagModel

  // Set up service, controller and route
  const authService = {
    createToken: jest.fn(),
    getUserIdFromToken: jest.fn(),
    getOfficerUser: jest.fn(),
    checkIfWhitelistedOfficer: jest.fn(),
    hasPermissionToAnswer: jest.fn(),
    getDisallowedTagsForUser: jest.fn(),
    verifyUserCanViewPost: jest.fn(),
    isOfficerEmail: jest.fn(),
  }
  const authMiddleware = { authenticate: jest.fn() }

  // Set up supertest
  const path = '/posts'
  const app = express()
  app.use(bodyParser.json())
  const request = supertest(app)

  beforeAll(async () => {
    db = await createTestDatabase()
    Answer = getModel<AnswerModel>(db, ModelName.Answer)
    Post = getModel<PostModel>(db, ModelName.Post)
    PostTag = getModel<PostTagModel>(db, ModelName.PostTag)
    Tag = getModel<TagModel>(db, ModelName.Tag)
    User = getModel<UserModel>(db, ModelName.User)
    Permission = getModel<PermissionModel>(db, ModelName.Permission)
    postService = new PostService({ Answer, Post, PostTag, Tag, User })
    mockUser = await User.create({
      username: 'answerer@test.gov.sg',
      displayname: '',
    })
    mockTag = await Tag.create({
      tagname: 'test',
      description: '',
      link: '',
      hasPilot: true,
      tagType: TagType.Topic,
    })
    for (let title = 1; title <= 20; title++) {
      const mockPost = await Post.create({
        title: title.toString(),
        status: PostStatus.Public,
        userId: mockUser.id,
      })
      mockPosts.push(mockPost)
      await PostTag.create({ postId: mockPost.id, tagId: mockTag.id })
    }
    await Permission.create({
      userId: mockUser.id,
      tagId: mockTag.id,
      role: PermissionType.Answerer,
    })
    controller = new PostController({ authService, postService })
    app.use(path, routePosts({ controller, authMiddleware }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await db.close()
  })

  describe('/posts', () => {
    it('returns 200 and data on posts on request', async () => {
      // Act
      const response = await request.get(path)

      // Assert
      expect(response.status).toEqual(StatusCodes.OK)
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
        withAnswers: false,
        sort: SortType.Top,
      })

      // Assert
      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body.posts.length).toStrictEqual(mockPosts.length)
      expect(response.body.totalItems).toStrictEqual(mockPosts.length)
    })
  })
})

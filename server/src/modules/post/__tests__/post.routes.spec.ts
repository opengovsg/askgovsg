import bodyParser from 'body-parser'
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { Sequelize } from 'sequelize'
import { ModelCtor } from 'sequelize/types'
import { ModelDef } from '../../../types/sequelize'
import supertest from 'supertest'
import {
  Agency,
  PermissionType,
  Post,
  PostStatus,
  TagType,
  Topic,
} from '~shared/types/base'
import {
  Answer as AnswerModel,
  Permission as PermissionModel,
  PostTag,
  Tag as TagModel,
  User as UserModel,
} from '../../../models'
import { PostCreation } from '../../../models/posts.model'
import { ControllerHandler } from '../../../types/response-handler'
import { SortType } from '../../../types/sort-type'
import {
  createTestDatabase,
  getModel,
  getModelDef,
  ModelName,
} from '../../../util/jest-db'
import { PostController } from '../post.controller'
import { routePosts } from '../post.routes'
import { PostService } from '../post.service'
import { UserService } from '../../user/user.service'

describe('/posts', () => {
  let db: Sequelize
  let Answer: ModelCtor<AnswerModel>
  let Post: ModelDef<Post, PostCreation>
  let PostTag: ModelDef<PostTag>
  let Tag: ModelCtor<TagModel>
  let User: ModelCtor<UserModel>
  let Permission: ModelCtor<PermissionModel>
  let Agency: ModelDef<Agency>
  let Topic: ModelDef<Topic>

  let userService: UserService
  let postService: PostService
  let controller: PostController

  const mockPosts: Post[] = []
  let mockUser: UserModel
  let mockTag: TagModel
  let mockTopic: Topic

  // Set up service, controller and route
  const authService = {
    checkIfWhitelistedOfficer: jest.fn(),
    hasPermissionToAnswer: jest.fn(),
    verifyUserCanViewPost: jest.fn(),
    isOfficerEmail: jest.fn(),
    verifyUserCanModifyTopic: jest.fn(),
    verifyUserInAgency: jest.fn(),
  }

  const authenticate: ControllerHandler = (req, res, next) => {
    req.user = { id: mockUser.id }
    next()
  }

  const authMiddleware = {
    authenticate,
  }

  // Set up supertest
  const path = '/posts'
  const app = express()
  app.use(bodyParser.json())
  app.use(authenticate)
  const request = supertest(app)

  beforeAll(async () => {
    db = await createTestDatabase()
    Answer = getModel<AnswerModel>(db, ModelName.Answer)
    Agency = getModelDef<Agency>(db, ModelName.Agency)
    Post = getModelDef<Post, PostCreation>(db, ModelName.Post)
    PostTag = getModelDef<PostTag>(db, ModelName.PostTag)
    Tag = getModel<TagModel>(db, ModelName.Tag)
    User = getModel<UserModel>(db, ModelName.User)
    Permission = getModel<PermissionModel>(db, ModelName.Permission)
    userService = new UserService({ User, Tag, Agency })
    Topic = getModelDef<Topic>(db, ModelName.Topic)
    postService = new PostService({ Answer, Post, PostTag, Tag, User, Topic })
    const { id: agencyId } = await Agency.create({
      shortname: 'was',
      longname: 'Work Allocation Singapore',
      email: 'enquiries@was.gov.sg',
      website: null,
      noEnquiriesMessage: null,
      logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
      displayOrder: [],
    })
    mockUser = await User.create({
      username: 'answerer@test.gov.sg',
      displayname: '',
      agencyId,
    })
    mockTag = await Tag.create({
      tagname: 'test',
      description: '',
      link: '',
      hasPilot: true,
      tagType: TagType.Topic,
    })
    mockTopic = await Topic.create({
      name: 'test',
      description: '',
      agencyId: mockUser.agencyId,
      parentId: null,
    })
    for (let title = 1; title <= 20; title++) {
      const mockPost = await Post.create({
        title: title.toString(),
        description: null,
        status: PostStatus.Public,
        userId: mockUser.id,
        agencyId: mockUser.agencyId,
        topicId: null,
      })
      mockPosts.push(mockPost)
      await PostTag.create({ postId: mockPost.id, tagId: mockTag.id })
    }
    await Permission.create({
      userId: mockUser.id,
      tagId: mockTag.id,
      role: PermissionType.Answerer,
    })
    controller = new PostController({ userService, authService, postService })
    app.use(path, routePosts({ controller, authMiddleware }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await db.close()
  })

  describe('GET /posts', () => {
    it('returns 200 and data on posts on request', async () => {
      // Act
      const response = await request.get(path)

      // Assert
      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body.posts.length).toStrictEqual(mockPosts.length)
      expect(response.body.totalItems).toStrictEqual(mockPosts.length)
    })
  })

  describe('GET /posts/answerable', () => {
    it('returns 200 and data on posts on request', async () => {
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

  describe('POST /posts', () => {
    it('returns 200 and creates a post on request', async () => {
      const body = {
        title: 'A title of at least 15 characters',
        description: null,
        tagname: [mockTag.tagname],
        topicname: mockTopic.name,
      }

      // Act
      const {
        status,
        body: { data: postId },
      } = await request.post(path).send(body)
      const post = await Post.findByPk(postId)
      const postTags = await PostTag.findAll({ where: { postId } })

      // Assert
      expect(status).toEqual(StatusCodes.OK)
      expect(post).toBeDefined()
      expect(postTags.length).toBe(1)
    })
  })
})

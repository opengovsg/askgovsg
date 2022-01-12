import express from 'express'
import session from 'express-session'
import { StatusCodes } from 'http-status-codes'
import minimatch from 'minimatch'
import { ModelCtor, Sequelize } from 'sequelize'
import { PostCreation } from 'src/models/posts.model'
import supertest, { Session } from 'supertest-session'
import { Agency, Post, Topic } from '~shared/types/base'
import { createAuthedSession, logoutSession } from '../../../../tests/mock-auth'
import { passportConfig } from '../../../bootstrap/passport'
import {
  Token as TokenModel,
  User as UserModel,
  PublicUser as PublicUserModel,
} from '../../../models'
import { ModelDef, ModelInstance } from '../../../types/sequelize'
import {
  createTestDatabase,
  getModel,
  getModelDef,
  ModelName,
} from '../../../util/jest-db'
import { AuthController } from '../auth.controller'
import { AuthMiddleware } from '../auth.middleware'
import { routeAuth } from '../auth.routes'
import { AuthService } from '../auth.service'
import { parse } from 'querystring'

describe('/auth', () => {
  const path = '/auth'
  const VALID_EMAIL = 'test@example.com'
  const emailValidator = new minimatch.Minimatch('*')

  // Mock as few services as possible for testing of authentication flow
  const mailService = { sendEnquiry: jest.fn(), sendLoginOtp: jest.fn() }
  const userService = {
    createOfficer: jest.fn(),
    loadUser: jest.fn(),
  }
  const publicUserService = {
    loadPublicUser: jest.fn(),
    loadPublicUserBySgid: jest.fn(),
    createPublicUserBySgid: jest.fn(),
  }
  let authService: AuthService
  let authController: AuthController

  const authMiddleware = new AuthMiddleware()

  // Set up supertest
  const app = express()
  app.use(express.json())
  let request: Session

  // Set up sequelize
  let db: Sequelize
  let Token: ModelCtor<TokenModel>
  let Agency: ModelDef<Agency>
  let User: ModelCtor<UserModel>
  let PublicUser: ModelCtor<PublicUserModel>
  let Topic: ModelDef<Topic>
  let Post: ModelDef<Post, PostCreation>
  let mockAgencyUser: UserModel
  let mockAgency: ModelInstance<Agency>

  beforeAll(async () => {
    db = await createTestDatabase()
    Token = getModel<TokenModel>(db, ModelName.Token)
    Agency = getModelDef<Agency>(db, ModelName.Agency)
    User = getModel<UserModel>(db, ModelName.User)
    Post = getModelDef<Post, PostCreation>(db, ModelName.Post)
    PublicUser = getModel<PublicUserModel>(db, ModelName.PublicUser)
    mockAgency = await Agency.create({
      shortname: 'was',
      longname: 'Work Allocation Singapore',
      email: 'enquiries@was.gov.sg',
      website: null,
      noEnquiriesMessage: null,
      logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
      displayOrder: [],
    })
    mockAgencyUser = await User.create({
      username: VALID_EMAIL,
      displayname: '',
      agencyId: mockAgency.id,
    })
    authService = new AuthService({
      emailValidator,
      User,
      Post,
      Topic,
    })
    authController = new AuthController({
      mailService,
      authService,
      userService,
      publicUserService,
      Token,
    })

    // passport and session
    app.use(
      session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        store: new session.MemoryStore(),
      }),
    )
    passportConfig(app, Token, User, PublicUser)

    // passport before route
    app.use(
      path,
      routeAuth({
        controller: authController,
        authMiddleware,
      }),
    )
  })

  beforeEach(() => {
    request = supertest(app)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('loadUser', () => {
    it('should return 400 when not logged in', async () => {
      // Act
      const result = await request.get(path)
      // Assert
      expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(result.body).toStrictEqual({ message: 'User is unauthorized.' })
    })

    it('should return 200 with user data when logged in', async () => {
      // Arrange
      userService.loadUser.mockReturnValueOnce(mockAgencyUser)
      // Log in user
      const session = await createAuthedSession(
        mockAgencyUser.username,
        request,
      )

      // Act
      const result = await session.get(path)

      // Assert
      expect(result.status).toEqual(StatusCodes.OK)
      // Body should be an user object.
      expect(result.body).toMatchObject({
        // Required since that's how the data is sent out from the application.
        username: mockAgencyUser.username,
        id: mockAgencyUser.id,
      })
    })

    it('should return 400 if logged out after logging in', async () => {
      // Log in user
      // Arrange
      userService.loadUser.mockReturnValueOnce(mockAgencyUser)
      const session = await createAuthedSession(
        mockAgencyUser.username,
        request,
      )

      // Act
      let result = await session.get(path)

      // Assert
      expect(result.status).toEqual(StatusCodes.OK)

      // Attempt to load user after logged out
      // Act
      request = await logoutSession(request)
      result = await request.get(path)
      // Assert
      expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(result.body).toStrictEqual({ message: 'User is unauthorized.' })
    })
  })

  describe('/sgid/login', () => {
    it('should return redirect with well-formed sgid url', async () => {
      // Act
      const result = await request.get('/auth/sgid/login')
      const resultLocation = parse(result.header.location.split('?')[1])

      // Assert
      expect(result.status).toEqual(StatusCodes.MOVED_TEMPORARILY)
      expect(resultLocation).toHaveProperty('response_type', 'code')
      expect(resultLocation).toHaveProperty('scope', 'openid myinfo.name')
      expect(resultLocation).toHaveProperty('client_id')
      expect(resultLocation).toHaveProperty('redirect_uri')
      expect(resultLocation).toHaveProperty('state')
    })
  })

  describe('/callback', () => {
    it('should return redirect if no code and state params', async () => {
      // Act
      const result = await request.get('/auth/callback')
      const resultLocation = parse(result.header.location.split('?')[1])

      // Assert
      expect(result.status).toEqual(StatusCodes.MOVED_TEMPORARILY)
      expect(resultLocation).toHaveProperty('response_type', 'code')
      expect(resultLocation).toHaveProperty('scope', 'openid myinfo.name')
      expect(resultLocation).toHaveProperty('client_id')
      expect(resultLocation).toHaveProperty('redirect_uri')
      expect(resultLocation).toHaveProperty('state')
    })
  })
})

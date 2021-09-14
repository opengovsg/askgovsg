import express from 'express'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { ControllerHandler } from '../../../types/response-handler'
import { AuthController } from '../auth.controller'
import { mocked } from 'ts-jest/utils'
import { generateRandomDigits, hashData } from '../../../util/hash'
import { Token as TokenModel } from '../../../models'
import { Sequelize, ModelCtor } from 'sequelize/types'
import { createTestDatabase, getModel, ModelName } from '../../../util/jest-db'
import passport from 'passport'
// import { Result, validationResult } from 'express-validator'
// import { createValidationErrMessage } from '../../../util/validation-error'
jest.mock('../../../util/hash')
jest.mock('passport')
// jest.mock('express-validator')
// jest.mock('../../../util/validation-error')

const mockedGenerateRandomDigits = mocked(generateRandomDigits)
const mockedHashData = mocked(hashData)
const mockedPassport = mocked(passport)
// const mockedValidator = mocked(validationResult)
// const mockedValidationErrMsg = mocked(createValidationErrMessage)

const VALID_EMAIL = 'test@example.com'

// Mock services invoked by authController
const mailService = { sendEnquiry: jest.fn(), sendLoginOtp: jest.fn() }
const authService = {
  checkIfWhitelistedOfficer: jest.fn(),
  hasPermissionToAnswer: jest.fn(),
  getDisallowedTagsForUser: jest.fn(),
  verifyUserCanViewPost: jest.fn(),
  isOfficerEmail: jest.fn(),
}
const userService = {
  createOfficer: jest.fn(),
  loadUser: jest.fn(),
}
let authController: AuthController

const path = '/auth'
// Set up auth middleware to inject user
const user: Express.User | undefined = { id: '1' }
const isAuthenticated = true
const middleware: ControllerHandler = (req, res, next) => {
  req.isAuthenticated = () => isAuthenticated
  req.logIn = (_, callback) => {
    callback()
  }
  ;(req.user = user), next()
}

// Set up supertest
const app = express()
app.use(express.json())
app.use(middleware)
const request = supertest(app)

// Set up sequelize
let db: Sequelize
let Token: ModelCtor<TokenModel>

beforeAll(async () => {
  db = await createTestDatabase()
  Token = getModel<TokenModel>(db, ModelName.Token)
  authController = new AuthController({
    mailService,
    authService,
    userService,
    Token,
  })
  app.get(path, authController.loadUser)
  app.post(path + '/sendotp', authController.handleSendLoginOtp)
  app.post(path + '/verifyotp', authController.handleVerifyLoginOtp)
  app.get(path + '/logout', authController.handleLogout)
})

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(async () => {
  await db.close()
})

describe('auth.controller', () => {
  describe('loadUser', () => {
    it('should return 200 when user id is valid', async () => {
      // Arrange
      const userData = { email: VALID_EMAIL }
      userService.loadUser.mockReturnValue(userData)

      // Act
      const response = await request.get(path)

      // Assert
      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(userData)
    })

    it('should return 500 if database error', async () => {
      // Arrange
      const error = new Error('Database error')
      userService.loadUser.mockImplementation(() => {
        throw error
      })

      // Act
      const response = await request.get(path)

      // Assert
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual(null)
    })
  })

  describe('handleSendLoginOtp', () => {
    const MOCK_OTP = '123456'
    const MOCK_OTP_HASH = 'abcdef123456'

    it('should return 200 when login OTP is generated and sent to recipient successfully', async () => {
      // Arrange
      authService.checkIfWhitelistedOfficer.mockReturnValue(user)
      mockedGenerateRandomDigits.mockReturnValue(MOCK_OTP)
      mockedHashData.mockResolvedValue(MOCK_OTP_HASH)

      // Act
      const response = await request
        .post(path + '/sendotp')
        .send({ email: VALID_EMAIL })

      // Assert
      expect(response.status).toEqual(200)
      // Services should have been invoked.
      expect(mockedGenerateRandomDigits).toHaveBeenCalledTimes(1)
      expect(mockedHashData).toHaveBeenCalledTimes(1)
    })

    it('should return 400 if email does not belong to a user', async () => {
      // Arrange
      const INVALID_EMAIL = 'fake email'
      const error = new Error('User is not a whitelisted officer')
      authService.checkIfWhitelistedOfficer.mockImplementation(() => {
        throw error
      })

      // Act
      const response = await request
        .post(path + '/sendotp')
        .send({ email: INVALID_EMAIL })

      // Assert
      expect(response.status).toEqual(400)
      expect(response.body).toStrictEqual({
        message:
          'You are not whitelisted as an officer who can answer questions.',
      })
    })

    it('should return 500 when there is an error sending login OTP', async () => {
      // Arrange
      const error = new Error('Mail sending error')
      authService.checkIfWhitelistedOfficer.mockReturnValue(user)
      mailService.sendLoginOtp.mockImplementation(() => {
        throw error
      })

      // Act
      const response = await request
        .post(path + '/sendotp')
        .send({ email: VALID_EMAIL })

      // Assert
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({
        message: 'Failed to send OTP, please try again later.',
      })
    })
  })

  describe('handleVerifyLoginOtp', () => {
    const MOCK_OTP = '123456'
    mockedPassport.authenticate.mockImplementation(
      (authType, options, callback) => () => {
        if (callback) {
          callback(null, user)
        }
      },
    )

    it('should return 200 when verification succeeds', async () => {
      // Arrange
      authService.isOfficerEmail.mockReturnValue(true)

      // Act
      const response = await request
        .post(path + '/verifyotp')
        .send({ email: VALID_EMAIL, otp: MOCK_OTP })

      // Assert
      expect(response.status).toEqual(StatusCodes.OK)
    })
  })
})

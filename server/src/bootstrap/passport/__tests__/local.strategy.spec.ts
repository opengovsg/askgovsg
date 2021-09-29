import passport from 'passport'
import { Token as TokenModel, User as UserModel } from '../../../models'
import { createTestDatabase, getModel, ModelName } from '../../../util/jest-db'
import { ModelCtor, Sequelize } from 'sequelize/types'
import * as hash from '../../../util/hash'
import { Strategy, VerifyFunction } from 'passport-local'
import { localStrategy, MAX_OTP_ATTEMPTS } from '../local.strategy'

jest.mock('passport-local', () => {
  const mLocalStrategy = jest.fn()
  return { Strategy: mLocalStrategy }
})
jest.mock('passport', () => {
  return { use: jest.fn() }
})

describe('localStrategy', () => {
  const verifySpy = jest.spyOn(hash, 'verifyHash')
  const mockedUsername = 'answerer@example.com'
  const mockedOtp = '123456'
  const mockedDone = jest.fn()
  const mockedStrategy = <jest.Mock<Strategy>>Strategy

  let db: Sequelize
  let Token: ModelCtor<TokenModel>
  let User: ModelCtor<UserModel>
  let verifyRef: VerifyFunction

  beforeAll(async () => {
    db = await createTestDatabase()
    Token = getModel<TokenModel>(db, ModelName.Token)
    User = getModel<UserModel>(db, ModelName.User)
    await User.create({
      username: mockedUsername,
      agencyId: null,
      displayname: '',
    })
  })

  beforeEach(() => {
    mockedStrategy.mockImplementation((_, verify) => {
      verifyRef = verify
      const mockedStrategy: Strategy = {
        name: '',
        authenticate: jest.fn(),
        success: jest.fn(),
        fail: jest.fn(),
        redirect: jest.fn(),
        pass: jest.fn(),
        error: jest.fn(),
      }
      return mockedStrategy
    })
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  it('should call done if otp and email is correct', async () => {
    // Arrange
    await Token.create({
      contact: mockedUsername,
      hashedOtp: mockedOtp,
      attempts: 0,
    })
    verifySpy.mockResolvedValue(true)
    await localStrategy(Token, User)
    const mockedUser = await User.findOne()

    // Act
    await verifyRef(mockedUsername, mockedOtp, mockedDone)

    // Assert
    expect(passport.use).toBeCalledWith(expect.any(Object))
    expect(Strategy).toBeCalledWith(
      { usernameField: 'email', passwordField: 'otp' },
      expect.any(Function),
    )
    expect(mockedDone).toBeCalledWith(null, mockedUser)
  })

  it('should return false if no otp sent for user', async () => {
    // Arrange
    verifySpy.mockResolvedValue(true)
    const fakeUsername = 'doesnotexist@example.com'
    await localStrategy(Token, User)

    // Act
    await verifyRef(fakeUsername, mockedOtp, mockedDone)

    // Assert
    expect(passport.use).toBeCalledWith(expect.any(Object))
    expect(Strategy).toBeCalledWith(
      { usernameField: 'email', passwordField: 'otp' },
      expect.any(Function),
    )
    expect(mockedDone).toBeCalledWith(null, false, {
      message: 'No OTP sent for this user.',
    })
  })

  it('should return false if otp is invalid', async () => {
    // Arrange
    const fakeToken = await Token.create({
      contact: mockedUsername,
      hashedOtp: mockedOtp,
      attempts: 0,
    })
    verifySpy.mockResolvedValue(false)
    await localStrategy(Token, User)

    // Act
    await verifyRef(mockedUsername, mockedOtp, mockedDone)

    // Assert
    expect(passport.use).toBeCalledWith(expect.any(Object))
    expect(Strategy).toBeCalledWith(
      { usernameField: 'email', passwordField: 'otp' },
      expect.any(Function),
    )
    expect(mockedDone).toBeCalledWith(null, false, {
      message: 'OTP is invalid. Please try again.',
    })

    // Cleanup
    await fakeToken.destroy()
  })

  it('should return false if no user exist with email', async () => {
    // Arrange
    verifySpy.mockResolvedValue(true)
    const fakeUsername = 'doesnotexist@example.com'
    const fakeToken = await Token.create({
      contact: fakeUsername,
      hashedOtp: mockedOtp,
      attempts: 0,
    })
    await localStrategy(Token, User)

    // Act
    await verifyRef(fakeUsername, mockedOtp, mockedDone)

    // Assert
    expect(passport.use).toBeCalledWith(expect.any(Object))
    expect(Strategy).toBeCalledWith(
      { usernameField: 'email', passwordField: 'otp' },
      expect.any(Function),
    )
    expect(mockedDone).toBeCalledWith(null, false, {
      message: 'No user exists with this email',
    })

    // Clean up
    await fakeToken.destroy()
  })

  it('should return false and delete token when exceeded attempts', async () => {
    // Arrange
    await Token.create({
      contact: mockedUsername,
      hashedOtp: mockedOtp,
      attempts: 0,
    })
    verifySpy.mockResolvedValue(false)
    await localStrategy(Token, User)

    // Try multiple times
    for (let i = 0; i < MAX_OTP_ATTEMPTS - 1; i++) {
      // Act
      await verifyRef(mockedUsername, mockedOtp, mockedDone)

      // Assert
      expect(mockedDone).toBeCalledWith(null, false, {
        message: 'OTP is invalid. Please try again.',
      })
      expect(await Token.count()).toBe(1)
      mockedDone.mockReset()
    }

    // Next time should delete token
    // Act
    await verifyRef(mockedUsername, mockedOtp, mockedDone)

    // Assert
    expect(mockedDone).toBeCalledWith(null, false, {
      message:
        'You have hit the max number of attempts. Please request for a new OTP.',
    })
    expect(await Token.count()).toBe(0)
  })
})

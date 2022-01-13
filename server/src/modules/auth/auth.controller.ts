import { validationResult } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { isEmpty } from 'lodash'
import passport from 'passport'
import { ModelCtor } from 'sequelize'
import {
  callbackRedirectUnauthorisedURL,
  callbackRedirectURL,
} from '../../bootstrap/config/auth'
import { Message } from 'src/types/message-type'
import {
  ErrorDto,
  LoadPublicUserDto,
  LoadUserDto,
  UserAuthType,
} from '~shared/types/api'
import { createLogger } from '../../bootstrap/logging'
import { Token } from '../../models'
import { UserService } from '../../modules/user/user.service'
import { ControllerHandler } from '../../types/response-handler'
import { generateRandomDigits, hashData } from '../../util/hash'
import { createValidationErrMessage } from '../../util/validation-error'
import { MailService } from '../mail/mail.service'
import { PublicUserService } from '../publicuser/publicuser.service'
import { AuthService } from './auth.service'

const OTP_LENGTH = 6

const logger = createLogger(module)

export class AuthController {
  private mailService: Public<MailService>
  private authService: Public<AuthService>
  private userService: Public<UserService>
  private publicUserService: Public<PublicUserService>
  private Token: ModelCtor<Token>

  constructor({
    mailService,
    authService,
    userService,
    publicUserService,
    Token,
  }: {
    mailService: Public<MailService>
    authService: Public<AuthService>
    userService: Public<UserService>
    publicUserService: Public<PublicUserService>
    Token: ModelCtor<Token>
  }) {
    this.mailService = mailService
    this.authService = authService
    this.userService = userService
    this.publicUserService = publicUserService
    this.Token = Token
  }

  /**
   * Fetch logged in user details after being authenticated.
   * @returns 200 with user details
   * @returns 500 if user id not found
   * @returns 500 if database error
   */
  loadUser: ControllerHandler<
    unknown,
    LoadPublicUserDto | LoadUserDto | ErrorDto
  > = async (req, res) => {
    const id = req.user?.id
    const type = req.user?.type
    if (!id) {
      logger.error({
        message: 'User not found after being authenticated',
        meta: {
          function: 'loadUser',
          userId: req.user?.id,
        },
      })
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(null)
    }

    if (type === UserAuthType.Public) {
      try {
        const user = await this.publicUserService.loadPublicUser(id)
        return res.status(StatusCodes.OK).json(user)
      } catch (error) {
        logger.error({
          message: 'Database Error while loading public user',
          meta: {
            function: 'loadPublicUser',
            userId: req.user?.id,
          },
          error,
        })
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(null)
      }
    }

    if (type === UserAuthType.Agency) {
      try {
        const user = await this.userService.loadUser(id)
        return res.status(StatusCodes.OK).json(user)
      } catch (error) {
        logger.error({
          message: 'Database Error while loading user',
          meta: {
            function: 'loadUser',
            userId: req.user?.id,
          },
          error,
        })
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(null)
      }
    }
  }

  /**
   * Send login otp to specified email
   * @body email email of the user and to send the OTP to
   * @returns 200 if OTP sent
   * @returns 400 if email is invalid
   * @returns 400 if email does not belong to a user
   * @returns 500 if OTP failed to send
   */
  handleSendLoginOtp: ControllerHandler<
    undefined,
    ErrorDto, // success case has no return data
    { email: string },
    undefined
  > = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: createValidationErrMessage(errors) })
    }

    const email = req.body.email

    try {
      await this.authService.checkIfWhitelistedOfficer(email)
    } catch (error) {
      logger.error({
        message: 'User is not whitelisted officer',
        meta: {
          function: 'handleSendLoginOtp',
        },
        error,
      })
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          'You are not whitelisted as an officer who can answer questions.',
      })
    }

    const otp = generateRandomDigits(OTP_LENGTH)
    const hashedOtp = await hashData(otp)

    // On staging and production, we use CloudFlare which adds a CF-Connecting-IP
    // header with every request which contains only the origin IP.
    // See https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-CloudFlare-handle-HTTP-Request-headers-.
    // As a fallback, use req.ip, automatically parsed from the x-forwarded-for
    // header if we configure app.set('trust proxy').

    const ip = req.header('CF-Connecting-IP') || req.ip

    try {
      await this.Token.destroy({ where: { contact: email } })
      await this.Token.create({ contact: email, hashedOtp, attempts: 0 })
      await this.mailService.sendLoginOtp(email, otp, ip)
    } catch (error) {
      logger.error({
        message: 'Error while sending login OTP',
        meta: {
          function: 'handleSendLoginOtp',
        },
        error,
      })
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to send OTP, please try again later.',
      })
    }
    return res.sendStatus(StatusCodes.OK)
  }

  /**
   * Verify otp received by the user
   * @body email email of user
   * @body otp otp of user
   * @returns 200 if successful login
   * @returns 400 if validation of body fails
   * @returns 422 if no otp was sent for user or wrong otp
   * @returns 500 if database error
   */
  handleVerifyLoginOtp: ControllerHandler<
    undefined,
    ErrorDto, // success case has no return data
    { email: string; otp: string },
    undefined
  > = async (req, res, next) => {
    const email = req.body.email
    if (!this.authService.isOfficerEmail(email)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message:
          'You must use a Singapore Public Service official email address.',
      })
    }
    passport.authenticate('local', {}, (error, user, info: Message) => {
      if (error) {
        logger.error({
          message: 'Error while authenticating',
          meta: {
            function: 'handleVerifyLoginOtp',
          },
          error,
        })
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: 'Server Error' })
      }
      if (!user) {
        logger.warn({
          message: info.message,
          meta: {
            function: 'handleVerifyLoginOtp',
          },
        })
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(info)
      }
      req.logIn(user, (error) => {
        if (error) {
          logger.error({
            message: 'Error while logging in',
            meta: {
              function: 'handleVerifyLoginOtp',
            },
            error,
          })
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: 'Server Error' })
        }

        //
        /**
         * Regenerate session to mitigate session fixation
         * We regenerate the session upon logging in so an
         * anonymous session cookie cannot be used
         */
        const passportSession = req.session.passport
        req.session.regenerate(function (error) {
          if (error) {
            logger.error({
              message: 'Error while regenerating session',
              meta: {
                function: 'handleVerifyLoginOtp',
              },
              error,
            })
            return res
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .json({ message: 'Server Error' })
          }
          //req.session.passport is now undefined
          req.session.passport = passportSession
          req.session.save(function (error) {
            if (error) {
              logger.error({
                message: 'Error while saving regenerated session',
                meta: {
                  function: 'handleVerifyLoginOtp',
                },
                error,
              })
              return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: 'Server Error' })
            }
            return res.sendStatus(StatusCodes.OK)
          })
        })
      })
    })(req, res, next)
  }

  /**
   * Logout
   * @returns 200 if logged out
   */
  handleLogout: ControllerHandler = (req, res) => {
    if (!req.session || isEmpty(req.session)) {
      logger.error({
        message: 'Attempted to sign out without a session',
        meta: {
          function: 'handleLogout',
        },
      })
      return res.sendStatus(StatusCodes.BAD_REQUEST)
    }

    req.session.destroy((error) => {
      if (error) {
        logger.error({
          message: 'Failed to destroy session',
          meta: {
            action: 'handleLogout',
            function: 'handleLogout',
          },
          error,
        })
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: 'Sign out failed' })
      }

      // No error.
      res.clearCookie('connect.sid')
      return res.status(StatusCodes.OK).json({ message: 'Sign out successful' })
    })
  }

  /**
   * Verify otp received by the user
   * @params code
   * @params state
   * @returns 302 to home page if successful login
   * @returns 302 to unauthorised page if error
   * @returns 302 to sgid auth page if no state or code params received
   */
  handleSgidLogin: ControllerHandler<
    undefined,
    undefined,
    undefined,
    { code: string; state: string | undefined }
  > = async (req, res, next) => {
    // console.log('controller req session', req.session)
    // console.log('controller req session id', req.sessionID)
    // console.log('controller req headers', req.rawHeaders)
    // console.log('controller res session id', res.req.sessionID)
    passport.authenticate('sgid', {}, (error, user, info: Message) => {
      // console.log('passport authenticate', req.rawHeaders)
      if (error) {
        logger.error({
          message: 'Error while authenticating',
          meta: {
            function: 'handleSgidLogin',
          },
          error,
        })
        return res.redirect(callbackRedirectUnauthorisedURL)
      }
      if (!user) {
        logger.warn({
          message: info.message,
          meta: {
            function: 'handleSgidLogin',
          },
        })
        res.redirect(callbackRedirectUnauthorisedURL)
      }
      req.logIn(user, (error) => {
        if (error) {
          logger.error({
            message: 'Error while logging in',
            meta: {
              function: 'handleSgidLogin',
            },
            error,
          })
          return res.redirect(callbackRedirectUnauthorisedURL)
        }
        //
        /**
         * Regenerate session to mitigate session fixation
         * We regenerate the session upon logging in so an
         * anonymous session cookie cannot be used
         */
        const passportSession = req.session.passport
        req.session.regenerate(function (error) {
          if (error) {
            logger.error({
              message: 'Error while regenerating session',
              meta: {
                function: 'handleSgidLogin',
              },
              error,
            })
            return res.redirect(callbackRedirectUnauthorisedURL)
          }
          //req.session.passport is now undefined
          req.session.passport = passportSession
          req.session.save(function (error) {
            if (error) {
              logger.error({
                message: 'Error while saving regenerated session',
                meta: {
                  function: 'handleSgidLogin',
                },
                error,
              })
              return res.redirect(callbackRedirectUnauthorisedURL)
            }
            return res.redirect(callbackRedirectURL)
          })
        })
      })
    })(req, res, next)
  }
}

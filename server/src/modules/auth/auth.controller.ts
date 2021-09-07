import { validationResult } from 'express-validator'
import { generateRandomDigits, hashData, verifyHash } from '../../util/hash'
import { User, Token } from '../../bootstrap/sequelize'
import { User as UserType } from '../../models'
import { createValidationErrMessage } from '../../util/validation-error'

import { MailService } from '../mail/mail.service'
import { AuthService } from './auth.service'
import { UserService } from '../../modules/user/user.service'
import { Request, Response } from 'express'
import { createLogger } from '../../bootstrap/logging'
import { ControllerHandler } from '../../types/response-handler'
import { Message } from '../../types/message-type'
import { StatusCodes } from 'http-status-codes'

const OTP_LENGTH = 6

const logger = createLogger(module)

export class AuthController {
  private mailService: Public<MailService>
  private authService: Public<AuthService>
  private userService: Public<UserService>

  constructor({
    mailService,
    authService,
    userService,
  }: {
    mailService: Public<MailService>
    authService: Public<AuthService>
    userService: Public<UserService>
  }) {
    this.mailService = mailService
    this.authService = authService
    this.userService = userService
  }

  /**
   * Fetch logged in user details
   * @returns 200 with user details
   * @returns 401 if user not signed in
   * @returns 500 if database error
   */
  loadUser: ControllerHandler<undefined, UserType | null | Message> = async (
    req,
    res,
  ) => {
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'User not signed in' })
    }

    try {
      const user = await this.userService.loadUser(req.user?.id)
      return res.status(StatusCodes.OK).json(user)
    } catch (error) {
      logger.error({
        message: 'Error while loading user',
        meta: {
          function: 'loadUser',
          userId: req.user?.id,
        },
        error,
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server Error' })
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
    Message,
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
    const ip =
      ((req.headers['x-forwarded-for'] as string) || '').split(',')[0] ||
      req.socket.remoteAddress ||
      ''
    try {
      await Token.destroy({ where: { contact: email } })
      await Token.create({ contact: email, hashedOtp })
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
   * Verify jwt received by the user and set the JWT
   * @body email email of user
   * @body otp otp of user
   * @returns 200 with JWT if successful login
   * @returns 400 if validation of body fails
   * @returns 401 if no otp was sent for user
   * @returns 401 if wrong otp
   * @returns 500 if database error
   */
  handleVerifyLoginOtp: ControllerHandler<
    undefined,
    { token?: string; newParticipant: boolean; displayname?: string } | Message,
    { email: string; otp: string },
    undefined
  > = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: createValidationErrMessage(errors) })
    }

    const email = req.body.email
    const otp = req.body.otp

    try {
      const token = await Token.findOne({ where: { contact: email } })
      if (!token) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: 'No OTP sent for this user.' })
      }

      const verifyHashResult = await verifyHash(String(otp), token.hashedOtp)
      if (!verifyHashResult) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: 'Wrong OTP, please try again.' })
      }

      const user = await User.findOne({ where: { username: email } })
      const newParticipant = false
      let jwt
      let displayname
      if (user) {
        jwt = this.authService.createToken(user.id)
        displayname = user.displayname
      } else {
        if (this.authService.isOfficerEmail(email)) {
          const officer = await this.userService.createOfficer(email)
          displayname = officer.displayname
          jwt = this.authService.createToken(officer.id)
        }
      }

      await Token.destroy({ where: { contact: email } })
      return res
        .status(StatusCodes.OK)
        .json({ token: jwt, newParticipant, displayname })
    } catch (error) {
      logger.error({
        message: 'Error while verifying login OTP',
        meta: {
          function: 'handleVerifyLoginOtp',
        },
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server Error' })
    }
  }
}

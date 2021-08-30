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

  loadUser: ControllerHandler<unknown, UserType | null | Message> = async (
    req,
    res,
  ) => {
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'User not signed in' })
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  handleSendLoginOtp = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
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
    try {
      await Token.destroy({ where: { contact: email } })
      await Token.create({ contact: email, hashedOtp })
      await this.mailService.sendLoginOtp(email, otp)
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

  handleVerifyLoginOtp = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
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
        jwt = this.userService.login(user.id)
        displayname = user.displayname
      } else {
        if (this.authService.isOfficerEmail(email)) {
          const officer = await this.userService.createOfficer(email)
          displayname = officer.displayname
          jwt = this.userService.login(officer.id)
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

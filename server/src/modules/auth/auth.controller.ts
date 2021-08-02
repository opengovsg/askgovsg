import helperFunction from '../../helpers/helperFunction'
import { validationResult } from 'express-validator'
import { generateRandomDigits, hashData, verifyHash } from '../../util/hash'
import { User, Token } from '../../bootstrap/sequelize'
import { createValidationErrMessage } from '../../util/validation-error'

import { MailService } from '../mail/mail.service'
import { AuthService } from './auth.service'
import { UserService } from '../../modules/user/user.service'
import { Request, Response } from 'express'
import { createLogger } from '../../bootstrap/logging'

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

  loadUser = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not signed in' })
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [error, data] = await this.userService.loadUser(req.user?.id)

      if (error) {
        logger.error({
          message: 'Error while loading user',
          meta: {
            function: 'loadUser',
            userId: req.user?.id,
          },
          error,
        })
        return res.status(error.code).json(error)
      }
      return res.status(data?.code || 200).json(data)
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
        .status(500)
        .json(helperFunction.responseHandler(false, 500, 'Server Error', null))
    }
  }

  handleSendLoginOtp = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(400)
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
      return res.status(400).json({
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
      return res.status(500).json({
        message: 'Failed to send OTP, please try again later.',
      })
    }
    return res.sendStatus(200)
  }

  handleVerifyLoginOtp = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: createValidationErrMessage(errors) })
    }

    const email = req.body.email
    const otp = req.body.otp

    try {
      const token = await Token.findOne({ where: { contact: email } })
      if (!token) {
        return res.status(401).json({ message: 'No OTP sent for this user.' })
      }

      const verifyHashResult = await verifyHash(String(otp), token.hashedOtp)
      if (!verifyHashResult) {
        return res.status(401).json({ message: 'Wrong OTP, please try again.' })
      }

      const user = await User.findOne({ where: { username: email } })
      const newParticipant = false
      let jwt
      let displayname
      if (user) {
        jwt = await this.userService.login(user.id)
        displayname = user.displayname
      } else {
        if (this.authService.isOfficerEmail(email)) {
          const officer = await this.userService.createOfficer(email)
          displayname = officer.displayname
          jwt = await this.userService.login(officer.id)
        }
      }

      await Token.destroy({ where: { contact: email } })
      return res.status(200).json({ token: jwt, newParticipant, displayname })
    } catch (error) {
      logger.error({
        message: 'Error while verifying login OTP',
        meta: {
          function: 'handleVerifyLoginOtp',
        },
      })
      return res
        .status(500)
        .json(helperFunction.responseHandler(true, 500, 'Server Error', null))
    }
  }
}

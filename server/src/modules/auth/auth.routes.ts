import express from 'express'
import { body } from 'express-validator'
import { AuthController } from './auth.controller'
import { AuthMiddleware } from './auth.middleware'

export const routeAuth = ({
  controller,
  middleware,
}: {
  controller: AuthController
  middleware: AuthMiddleware
}): express.Router => {
  const router = express.Router()

  /**
   * @route      GET /api/auth
   * @desc       fetch logged in user details
   * @access     Private
   */
  router.get('/', middleware.authenticate, controller.loadUser)

  /**
   * @route      POST /api/auth/verifyotp
   * @desc       verify the otp received by user
   * @access     Private
   */
  router.post(
    '/verifyotp',
    [
      body('email', 'Please include a valid email')
        .trim()
        .isEmail()
        .normalizeEmail(),
      body('otp', '6-digit OTP is required')
        .trim()
        .isLength({ min: 6, max: 6 })
        .isInt(),
    ],
    controller.handleVerifyLoginOtp,
  )

  /**
   * @route      POST /api/auth/sendotp
   * @desc       send the otp to the specified email
   * @access     Private
   */
  router.post(
    '/sendotp',
    body('email', 'Please include a valid email')
      .trim()
      .isEmail()
      .normalizeEmail(),
    controller.handleSendLoginOtp,
  )

  return router
}

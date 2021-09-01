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
   * Fetch logged in user details
   * @route   GET /api/auth
   * @returns 200 with user details
   * @returns 401 if user not signed in
   * @returns 500 if database error
   * @access  Private
   */
  router.get('/', middleware.authenticate, controller.loadUser)

  /**
   * Verify jwt received by the user and set the JWT
   * @route   POST /api/auth/verifyotp
   * @returns 200 with JWT if successful login
   * @returns 400 if validation of body fails
   * @returns 401 if no otp was sent for user
   * @returns 401 if wrong otp
   * @returns 500 if database error
   * @access  Private
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
   * Send login otp to specified email
   * @route   POST /api/auth/sendotp
   * @returns 200 if OTP sent
   * @returns 400 if email is invalid
   * @returns 400 if email does not belong to a user
   * @returns 500 if OTP failed to send
   * @access  Private
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

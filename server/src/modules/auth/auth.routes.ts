import express from 'express'
import { body } from 'express-validator'
import passport from 'passport'
import { AuthController } from './auth.controller'
import { AuthMiddleware } from './auth.middleware'

export const routeAuth = ({
  controller,
  authMiddleware,
}: {
  controller: AuthController
  authMiddleware: AuthMiddleware
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
  router.get('/', authMiddleware.authenticate, controller.loadUser)

  /**
   * Verify otp received by the user and store the session
   * @route   POST /api/auth/verifyotp
   * @returns 200 if successful login
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

  /**
   * Logout
   * @route   POST /api/auth/logout
   * @returns 200 if logged out
   * @access  private
   */
  router.post('/logout', controller.handleLogout)

  /**
   * Sgid Login
   * @route   POST /api/auth/sgid/login
   * @returns 302 with sgid oidc link
   * @access  private
   */
  router.get('/sgid/login', async (req, res, next) => {
    console.log('/sgid/login', req.session)
    console.log('/sgid/login session id', req.sessionID)
    passport.authenticate('sgid')(req, res, next)
  })

  /**
   * Sgid Callback
   * @route   GET /api/auth/callback
   * @returns 302 to home page if successful login
   * @returns 302 to unauthorised page if error
   * @returns 302 to sgid auth page if no state or code params received
   * @access  private
   */
  router.get('/callback', controller.handleSgidLogin)

  return router
}

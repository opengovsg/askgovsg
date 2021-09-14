import { StatusCodes } from 'http-status-codes'
import { ControllerHandler } from '../../types/response-handler'

export class AuthMiddleware {
  /**
   * Middleware that only allows authenticated users to pass through to the next
   * handler.
   * @returns next if user exists in session
   * @returns 401 if user does not exist in session
   */
  authenticate: ControllerHandler = (req, res, next) => {
    // Check if user is authenticated
    if (!req.isAuthenticated() || !req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'User is unauthorized.' })
    }
    return next()
  }
}

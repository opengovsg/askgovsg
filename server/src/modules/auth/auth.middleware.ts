import { StatusCodes } from 'http-status-codes'
import { ControllerHandler } from '../../types/response-handler'

export class AuthMiddleware {
  authenticate: ControllerHandler = (req, res, next) => {
    // Check if user is authenticated
    if (!req.isAuthenticated() || !req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Not signed-in' })
    }
    return next()
  }
}

import jwt from 'jsonwebtoken'
import { createLogger } from '../../bootstrap/logging'
import helperFunction from '../../helpers/helperFunction'
import { ControllerHandler } from '../../types/response-handler'

const logger = createLogger(module)

export class AuthMiddleware {
  private jwtSecret: string

  constructor({ jwtSecret }: { jwtSecret: string }) {
    this.jwtSecret = jwtSecret
  }

  authenticate: ControllerHandler = (req, res, next) => {
    const token = req.header('x-auth-token') ?? ''

    // Check if no token
    if (!token) {
      return res
        .status(401)
        .json(
          helperFunction.responseHandler(false, 401, 'Sign-in required', null),
        )
    }

    // Verify token
    try {
      jwt.verify(token, this.jwtSecret, (error, decoded) => {
        if (error) {
          return res
            .status(401)
            .json(
              helperFunction.responseHandler(
                false,
                401,
                'Sign-in required',
                null,
              ),
            )
        } else {
          req.user = (decoded as { user: Express.User }).user
          return next()
        }
      })
    } catch (error) {
      logger.error({
        message: 'JWT could not be verified',
        meta: {
          function: 'authenticate',
        },
        error,
      })
      return res
        .status(500)
        .json(helperFunction.responseHandler(false, 500, 'Server Error', null))
    }
  }
}

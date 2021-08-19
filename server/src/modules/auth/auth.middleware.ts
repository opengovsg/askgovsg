import jwt from 'jsonwebtoken'
import { createLogger } from '../../bootstrap/logging'
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
      return res.status(401).json({ message: 'Sign-in required' })
    }

    // Verify token
    try {
      jwt.verify(token, this.jwtSecret, (error, decoded) => {
        if (error) {
          return res.status(400).json({ message: 'Invalid token' })
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
      return res.status(500).json({ message: 'Server Error' })
    }
  }
}

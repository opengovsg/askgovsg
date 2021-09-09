import { ControllerHandler } from '../../types/response-handler'

export class AuthMiddleware {
  authenticate: ControllerHandler = (req, res, next) => {
    // Check if user is authenticated
    if (!req.isAuthenticated() || !req.user) {
      return res.redirect('/login')
    }
    return next()
  }
}

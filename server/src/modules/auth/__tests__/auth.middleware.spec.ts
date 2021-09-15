import express from 'express'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { ControllerHandler } from '../../../types/response-handler'

import { AuthMiddleware } from '../auth.middleware'

describe('auth.middleware', () => {
  const path = '/auth'
  const authMiddleware = new AuthMiddleware()
  // Set up auth middleware to inject user
  const user: Express.User | undefined = { id: 1 }
  let isAuthenticated = true
  const middleware: ControllerHandler = (req, res, next) => {
    req.isAuthenticated = () => isAuthenticated
    ;(req.user = user), next()
  }

  const app = express()
  app.use(express.json())
  app.use(middleware)
  app.get(path, authMiddleware.authenticate)
  const request = supertest(app)
  describe('authenticate', () => {
    it('should pass on to the next handler if authenticated', async () => {
      // Arrange
      isAuthenticated = true
      app.use(function (req, res) {
        res.end()
      })

      // Act
      const response = await request.get(path)

      // Assert
      expect(response.status).toEqual(StatusCodes.OK)
    })

    it('should return 401 if not authenticated', async () => {
      // Arrange
      isAuthenticated = false
      // Act
      const response = await request.get(path)
      // Assert
      expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(response.body).toStrictEqual({
        message: 'User is unauthorized.',
      })
    })
  })
})

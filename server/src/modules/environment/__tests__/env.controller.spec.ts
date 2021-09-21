import express from 'express'
import supertest from 'supertest'
import { EnvController } from '../env.controller'

describe('EnvController', () => {
  const path = '/environment'
  const bannerMessage = ''
  const googleAnalyticsId = ''
  const fullStoryOrgId = ''

  const controller = new EnvController({
    bannerMessage,
    googleAnalyticsId,
    fullStoryOrgId,
  })

  const app = express()
  app.get(path, controller.getEnvironmentVars)
  const request = supertest(app)

  describe('getEnvironmentVars', () => {
    it('returns environment variables', async () => {
      //Act
      const response = await request.get(path)

      //Assert
      expect(response.body).toStrictEqual({
        bannerMessage: bannerMessage,
        googleAnalyticsId: googleAnalyticsId,
        fullStoryOrgId: fullStoryOrgId,
      })
    })
  })
})

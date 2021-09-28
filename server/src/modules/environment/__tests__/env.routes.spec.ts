import { routeEnv } from '../env.routes'
import { EnvController } from '../env.controller'
import express from 'express'
import supertest, { SuperTest, Test } from 'supertest'
import { StatusCodes } from 'http-status-codes'

describe('/environment', () => {
  const path = '/environment'
  const bannerMessage = ''
  const googleAnalyticsId = ''
  const fullStoryOrgId = ''

  let request: SuperTest<Test>

  beforeAll(async () => {
    const controller = new EnvController({
      bannerMessage,
      googleAnalyticsId,
      fullStoryOrgId,
    })
    const router = routeEnv({ controller })
    const app = express()
    app.use(path, router)
    request = supertest(app)
  })

  describe('/', () => {
    it('returns environment variables', async () => {
      const response = await request.get(path)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual({
        bannerMessage: bannerMessage,
        googleAnalyticsId: googleAnalyticsId,
        fullStoryOrgId: fullStoryOrgId,
      })
    })
  })
})

import { routeAgencies } from '../agency.routes'
import { AgencyService } from '../agency.service'
import { AgencyController } from '../agency.controller'
import { createTestDatabase, getModel, ModelName } from '../../../util/jest-db'
import { Sequelize, Model } from 'sequelize'
import { Agency } from '~shared/types/base'
import { ModelDef } from '../../../types/sequelize'
import express from 'express'
import supertest, { SuperTest, Test } from 'supertest'
import { StatusCodes } from 'http-status-codes'

describe('/agencies', () => {
  const path = '/agencies'
  let agency: Agency &
    Model<Agency, Omit<Agency, 'updatedAt' | 'createdAt' | 'id'>>
  let db: Sequelize
  let Agency: ModelDef<Agency>

  let request: SuperTest<Test>

  beforeAll(async () => {
    db = await createTestDatabase()
    Agency = getModel<Agency & Model>(db, ModelName.Agency)
    agency = await Agency.create({
      shortname: 'was',
      longname: 'Work Allocation Singapore',
      email: 'enquiries@was.gov.sg',
      logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
    })
    const agencyService = new AgencyService({ Agency })
    const controller = new AgencyController({ agencyService })
    const router = routeAgencies({ controller })
    const app = express()
    app.use(path, router)
    request = supertest(app)
  })

  afterAll(async () => {
    await db.close()
  })

  describe('?shortname=<shortname>&longname=<longname>', () => {
    it('returns agency by name', async () => {
      const { shortname, longname } = agency
      const response = await request.get(path).query({ shortname, longname })

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual({
        ...agency.get(),
        createdAt: `${(agency.createdAt as Date).toISOString()}`,
        updatedAt: `${(agency.updatedAt as Date).toISOString()}`,
      })
    })
  })

  describe(`/:agencyId`, () => {
    it('returns agency by id', async () => {
      const { id } = agency
      const response = await request.get(`${path}/${id}`)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual({
        ...agency.get(),
        createdAt: `${(agency.createdAt as Date).toISOString()}`,
        updatedAt: `${(agency.updatedAt as Date).toISOString()}`,
      })
    })
  })
})

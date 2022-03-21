import express from 'express'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { AgencyController } from '../agency.controller'
import { errAsync, okAsync } from 'neverthrow'
import { MissingAgencyError } from '../agency.errors'
import { DatabaseError } from '../../core/core.errors'

describe('AgencyController', () => {
  const agency = {
    id: 1,
    shortname: 'was',
    longname: 'Work Allocation Singapore',
    email: 'enquiries@was.gov.sg',
    logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
  }
  const agencyService = {
    findOneByName: jest.fn(),
    findOneById: jest.fn(),
    listAgencyShortNames: jest.fn(),
    listAllAgencies: jest.fn()
  }
  const agencyController = new AgencyController({ agencyService })

  const app = express()
  app.get('/', agencyController.listAllAgencies)
  app.get('/:agencyId', agencyController.getSingleAgencyById)
  const request = supertest(app)

  beforeEach(() => {
    agencyService.findOneByName.mockReset()
    agencyService.findOneById.mockReset()
    agencyService.listAllAgencies.mockReset()
    agencyService.findOneByName.mockReturnValue(okAsync(agency))
    agencyService.findOneById.mockReturnValue(okAsync(agency))
    agencyService.listAllAgencies.mockReturnValue(okAsync(agency))
  })

  describe('listAllAgencies', () => {
    it('returns OK on valid query', async () => {
      const response = await request.get('/')
      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(agency)
    })

    it('returns INTERNAL_SERVER_ERROR on bad service', async () => {
      agencyService.listAllAgencies.mockReturnValue(errAsync(new DatabaseError()))
      const response = await request.get('/')
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
    })
  })

  describe('getSingleAgencyById', () => {
    it('returns OK on valid query', async () => {
      const id = `${agency.id}`

      const response = await request.get(`/${id}`)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(agency)
      expect(agencyService.findOneById).toHaveBeenCalledWith(id)
    })

    it('returns NOT_FOUND on invalid query', async () => {
      const id = `${agency.id}`
      agencyService.findOneById.mockReturnValue(
        errAsync(new MissingAgencyError()),
      )

      const response = await request.get(`/${id}`)

      expect(response.status).toEqual(StatusCodes.NOT_FOUND)
      expect(response.body).toStrictEqual({ message: 'Agency not found' })
      expect(agencyService.findOneById).toHaveBeenCalledWith(id)
    })

    it('returns INTERNAL_SERVER_ERROR on bad service', async () => {
      const id = `${agency.id}`
      agencyService.findOneById.mockReturnValue(errAsync(new DatabaseError()))

      const response = await request.get(`/${id}`)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(agencyService.findOneById).toHaveBeenCalledWith(id)
    })
  })
})

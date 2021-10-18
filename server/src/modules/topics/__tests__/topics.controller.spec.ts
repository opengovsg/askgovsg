import express from 'express'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { TopicsController } from '../topics.controller'
import { errAsync, okAsync } from 'neverthrow'
import { MissingTopicError } from '../topics.errors'
import { DatabaseError } from '../../core/core.errors'

describe('TopicsController', () => {
  const agency = {
    id: 1,
    shortname: 'was',
    longname: 'Work Allocation Singapore',
    email: 'enquiries@was.gov.sg',
    logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
  }

  const mockTopic = {
    id: 1,
    name: '1',
    description: '',
    agencyId: 1,
    parentId: null,
  }

  const authService = {
    checkIfWhitelistedOfficer: jest.fn(),
    hasPermissionToAnswer: jest.fn(),
    getDisallowedTagsForUser: jest.fn(),
    verifyUserCanViewPost: jest.fn(),
    isOfficerEmail: jest.fn(),
    verifyUserCanModifyTopic: jest.fn(),
    verifyUserInAgency: jest.fn(),
  }

  const topicsService = {
    findOneById: jest.fn(),
    listTopicsUsedByAgency: jest.fn(),
    createTopic: jest.fn(),
    deleteTopicById: jest.fn(),
    updateTopicById: jest.fn(),
  }
  const topicsController = new TopicsController({
    authService,
    topicsService,
  })

  const app = express()
  app.get('/:agencyId', topicsController.listTopicsUsedByAgency)
  const request = supertest(app)

  beforeEach(() => {
    topicsService.findOneById.mockReset()
    topicsService.listTopicsUsedByAgency.mockReset()
    topicsService.createTopic.mockReset()
    topicsService.deleteTopicById.mockReset()
    topicsService.updateTopicById.mockReset()
    topicsService.listTopicsUsedByAgency.mockReturnValue(okAsync(mockTopic))
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('listTopicsUsedByAgency', () => {
    it('should return 200 on successful data retrieval', async () => {
      const agencyId = `${agency.id}`

      const response = await request.get(`/${agencyId}`)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(mockTopic)
      expect(topicsService.listTopicsUsedByAgency).toHaveBeenCalledWith(
        Number(agencyId),
      )
    })

    it('returns NOT_FOUND on invalid query', async () => {
      const agencyId = `${agency.id}`

      topicsService.listTopicsUsedByAgency.mockReturnValue(
        errAsync(new MissingTopicError()),
      )

      const response = await request.get(`/${agencyId}`)

      expect(response.status).toEqual(StatusCodes.NOT_FOUND)
      expect(response.body).toStrictEqual({ message: 'Topic not found' })
      expect(topicsService.listTopicsUsedByAgency).toHaveBeenCalledWith(
        Number(agencyId),
      )
    })

    it('returns INTERNAL_SERVER_ERROR', async () => {
      const agencyId = `${agency.id}`

      topicsService.listTopicsUsedByAgency.mockReturnValue(
        errAsync(new DatabaseError()),
      )

      const response = await request.get(`/${agencyId}`)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(topicsService.listTopicsUsedByAgency).toHaveBeenCalledWith(
        Number(agencyId),
      )
    })
  })

  //TODO: add remaining unit tests for createTopic, deleteTopic, updateTopic
})

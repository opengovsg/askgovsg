import { Topic, Agency } from '~shared/types/base'
import { routeTopics } from '../topics.routes'
import { TopicsService, TopicWithChildRelations } from '../topics.service'
import { TopicsController } from '../topics.controller'
import { ControllerHandler } from '../../../types/response-handler'
import { createTestDatabase, getModel, ModelName } from '../../../util/jest-db'
import { Sequelize, Model } from 'sequelize'
import { ModelDef } from '../../../types/sequelize'
import express from 'express'
import supertest, { SuperTest, Test } from 'supertest'
import { StatusCodes } from 'http-status-codes'

describe('/topics', () => {
  const path = '/topics'
  let mockAgency: Agency
  let mockTopic1: Topic
  let mockTopic2: Topic
  let mockTopic3: Topic
  let mockTopic4: Topic
  let mockTopics: TopicWithChildRelations[]
  let db: Sequelize
  let request: SuperTest<Test>
  let Agency: ModelDef<Agency>
  let Topic: ModelDef<Topic>

  // Set up service, controller and route
  const authService = {
    checkIfWhitelistedOfficer: jest.fn(),
    hasPermissionToAnswer: jest.fn(),
    getDisallowedTagsForUser: jest.fn(),
    verifyUserCanViewPost: jest.fn(),
    isOfficerEmail: jest.fn(),
    verifyUserCanModifyTopic: jest.fn(),
    verifyUserInAgency: jest.fn(),
  }

  const authenticate: ControllerHandler = (req, res, next) => {
    req.user = { id: 1 }
    next()
  }

  const authMiddleware = {
    authenticate,
  }

  beforeAll(async () => {
    db = await createTestDatabase()
    Topic = getModel<Topic & Model>(db, ModelName.Topic)
    Agency = getModel<Agency & Model>(db, ModelName.Agency)

    mockAgency = await Agency.create({
      shortname: 'was',
      longname: 'Work Allocation Singapore',
      email: 'enquiries@was.gov.sg',
      logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
      noEnquiriesMessage: null,
      website: null,
      displayOrder: null,
    })

    mockTopic1 = await Topic.create({
      name: '1',
      description: '',
      agencyId: mockAgency.id,
      parentId: null,
    })
    mockTopic2 = await Topic.create({
      name: '2',
      description: '',
      agencyId: mockAgency.id,
      parentId: mockTopic1.id,
    })
    mockTopic3 = await Topic.create({
      name: '3',
      description: '',
      agencyId: mockAgency.id,
      parentId: mockTopic2.id,
    })
    mockTopic4 = await Topic.create({
      name: '4',
      description: '',
      agencyId: mockAgency.id,
      parentId: null,
    })

    mockTopics = [
      {
        ...mockTopic1,
        children: [{ ...mockTopic2, children: [mockTopic3] }],
      },
      mockTopic4,
    ]

    const topicsService = new TopicsService({ Topic })
    const controller = new TopicsController({
      authService,
      topicsService,
    })

    const router = routeTopics({ controller, authMiddleware })
    const app = express()
    app.use(authenticate)
    app.use(path, router)
    request = supertest(app)
  })

  afterAll(async () => {
    await db.close()
  })

  //TODO: Add unit tests for create/update/delete topic
  describe(`/`, () => {
    it('returns 200 if topic is successfully created', async () => {
      return
    })
  })
})

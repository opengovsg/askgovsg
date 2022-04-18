import { routeAgencies } from '../agency.routes'
import { AgencyService } from '../agency.service'
import { AgencyController } from '../agency.controller'
import {
  TopicsService,
  TopicWithChildRelations,
} from '../../topics/topics.service'
import { TopicsController } from '../../topics/topics.controller'
import {
  createTestDatabase,
  getModel,
  getModelDef,
  ModelName,
} from '../../../util/jest-db'
import { Sequelize, Model } from 'sequelize'
import { Agency, Topic, Post } from '~shared/types/base'
import { ModelDef } from '../../../types/sequelize'
import express from 'express'
import supertest, { SuperTest, Test } from 'supertest'
import { StatusCodes } from 'http-status-codes'
import { PostService } from '../../post/post.service'
import {
  Answer as AnswerModel,
  PostTag,
  Tag as TagModel,
  User as UserModel,
} from '../../../models'
import { PostCreation } from '../../../models/posts.model'

describe('/agencies', () => {
  const path = '/agencies'
  let agency: Agency &
    Model<Agency, Omit<Agency, 'updatedAt' | 'createdAt' | 'id'>>
  let db: Sequelize
  let Agency: ModelDef<Agency>
  let mockTopic1: Topic
  let mockTopic2: Topic
  let mockTopics: TopicWithChildRelations[]
  let Topic: ModelDef<Topic>

  let request: SuperTest<Test>

  const authService = {
    checkIfWhitelistedOfficer: jest.fn(),
    hasPermissionToAnswer: jest.fn(),
    verifyUserCanViewPost: jest.fn(),
    isOfficerEmail: jest.fn(),
    verifyUserCanModifyTopic: jest.fn(),
    verifyUserInAgency: jest.fn(),
  }

  beforeAll(async () => {
    db = await createTestDatabase()
    Agency = getModel<Agency & Model>(db, ModelName.Agency)
    Topic = getModel<Topic & Model>(db, ModelName.Topic)
    const Answer = getModel<AnswerModel>(db, ModelName.Answer)
    const Post = getModelDef<Post, PostCreation>(db, ModelName.Post)
    const PostTag = getModelDef<PostTag>(db, ModelName.PostTag)
    const Tag = getModel<TagModel>(db, ModelName.Tag)
    const User = getModel<UserModel>(db, ModelName.User)
    const searchSyncService = {
      createPost: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
    }

    agency = await Agency.create({
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
      agencyId: agency.id,
      parentId: null,
    })
    mockTopic2 = await Topic.create({
      name: '2',
      description: '',
      agencyId: agency.id,
      parentId: mockTopic1.id,
    })
    mockTopics = [
      {
        ...mockTopic1,
        children: [{ ...mockTopic2 }],
      },
    ]

    const agencyService = new AgencyService({ Agency })
    const controller = new AgencyController({ agencyService })
    const topicsService = new TopicsService({ Topic })
    const postService = new PostService({
      Answer,
      Post,
      PostTag,
      Tag,
      User,
      Topic,
      searchSyncService,
      sequelize: db,
    })
    const topicsController = new TopicsController({
      authService,
      topicsService,
      postService,
    })
    const router = routeAgencies({ controller, topicsController })
    const app = express()
    app.use(path, router)
    request = supertest(app)
  })

  afterAll(async () => {
    await db.close()
  })

  describe('/', () => {
    it('returns list of all agencies', async () => {
      const response = await request.get(path)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual([
        {
          ...agency.get(),
          createdAt: `${(agency.createdAt as Date).toISOString()}`,
          updatedAt: `${(agency.updatedAt as Date).toISOString()}`,
        },
      ])
    })
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

  describe(`/:agencyId/topics`, () => {
    it('returns 200 and nested list of posts corresponding to an agency on request', async () => {
      const { id } = agency
      const response = await request.get(`${path}/${id}/topics`)
      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body.length).toStrictEqual(mockTopics.length)
    })
  })
})

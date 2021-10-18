import { TopicsService, TopicWithChildRelations } from '../topics.service'
import { createTestDatabase, getModel, ModelName } from '../../../util/jest-db'
import { Sequelize, Model } from 'sequelize'
import { Topic, Agency } from '~shared/types/base'
import { ModelDef } from '../../../types/sequelize'
import { MissingTopicError } from '../topics.errors'

describe('TopicsService', () => {
  let db: Sequelize
  let Topic: ModelDef<Topic>
  let mockTopic1: Topic
  let mockTopic2: Topic
  let mockTopic3: Topic
  let mockTopic4: Topic
  let mockTopics: TopicWithChildRelations[]
  let topicService: TopicsService
  let Agency: ModelDef<Agency>
  let mockAgency: Agency

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

    topicService = new TopicsService({ Topic })
  })

  afterAll(async () => {
    await db.close()
  })

  const expectTopicMatch = (
    actualTopics: TopicWithChildRelations[],
    mockTopics: TopicWithChildRelations[],
  ) => {
    expect(actualTopics.length).toStrictEqual(mockTopics.length)
    expect(actualTopics[0].id).toStrictEqual(mockTopics[0].id)
    expect(actualTopics[0].name).toStrictEqual(mockTopics[0].name)
    expect(actualTopics[0].description).toStrictEqual(mockTopics[0].description)
    expect(actualTopics[0].parentId).toStrictEqual(mockTopics[0].parentId)
    expect(actualTopics[0].children?.[0].id).toStrictEqual(
      mockTopics[0].children?.[0].id,
    )
  }

  describe('listTopicsUsedByAgency', () => {
    it('lists topics given an agency id', async () => {
      const { id } = mockAgency
      const actualTopics = await topicService.listTopicsUsedByAgency(id)
      expectTopicMatch(actualTopics._unsafeUnwrap(), mockTopics)
    })

    it('returns MissingTopicError on non-existing agency', async () => {
      const id = mockAgency.id + 20
      const actualTopic = await topicService.listTopicsUsedByAgency(id)
      expect(actualTopic._unsafeUnwrapErr()).toEqual(new MissingTopicError())
    })
  })

  //TODO: add remaining unit tests for createTopic, deleteTopicById, updateTopicById
})

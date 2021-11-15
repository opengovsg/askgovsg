import { TopicsService, TopicWithChildRelations } from '../topics.service'
import {
  createTestDatabase,
  getModelDef,
  ModelName,
} from '../../../util/jest-db'
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
    Topic = getModelDef<Topic>(db, ModelName.Topic)
    Agency = getModelDef<Agency>(db, ModelName.Agency)
    topicService = new TopicsService({ Topic })

    mockAgency = await Agency.create({
      shortname: 'was',
      longname: 'Work Allocation Singapore',
      email: 'enquiries@was.gov.sg',
      logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
      noEnquiriesMessage: null,
      website: null,
      displayOrder: null,
    })
  })

  beforeEach(async () => {
    await Topic.destroy({ truncate: true })

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
  })

  afterAll(async () => {
    await db.close()
  })

  const expectTopicsMatch = (
    actualTopics: TopicWithChildRelations[],
    mockTopics: TopicWithChildRelations[],
  ) => {
    expect(actualTopics.length).toStrictEqual(mockTopics.length)
    expect(actualTopics[0].id).toStrictEqual(mockTopic1.id)
    expect(actualTopics[0].name).toStrictEqual(mockTopic1.name)
    expect(actualTopics[0].description).toStrictEqual(mockTopic1.description)
    expect(actualTopics[0].parentId).toStrictEqual(mockTopic1.parentId)
    expect(actualTopics[0].children?.[0].id).toStrictEqual(mockTopic2.id)
  }

  const expectTopicMatch = (actualTopic: Topic, mockTopic: Topic) => {
    expect(actualTopic.id).toStrictEqual(mockTopic.id)
    expect(actualTopic.name).toStrictEqual(mockTopic.name)
    expect(actualTopic.description).toStrictEqual(mockTopic.description)
    expect(actualTopic.parentId).toStrictEqual(mockTopic.parentId)
  }

  describe('getTopicById', () => {
    it('finds a topic given a topic id', async () => {
      const { id } = mockTopic1
      const actualTopic = await topicService.getTopicById(id)
      expectTopicMatch(actualTopic._unsafeUnwrap(), mockTopic1)
    })
    it('returns MissingTopicError on non-existing id', async () => {
      const id = mockTopic1.id + 20
      const actualTopic = await topicService.getTopicById(id)
      expect(actualTopic._unsafeUnwrapErr()).toEqual(new MissingTopicError())
    })
  })

  describe('listTopicsUsedByAgency', () => {
    it('lists topics given an agency id', async () => {
      const { id } = mockAgency
      const actualTopics = await topicService.listTopicsUsedByAgency(id)
      expectTopicsMatch(actualTopics._unsafeUnwrap(), mockTopics)
    })

    it('returns MissingTopicError on non-existing agency', async () => {
      const id = mockAgency.id + 20
      const actualTopic = await topicService.listTopicsUsedByAgency(id)
      expect(actualTopic._unsafeUnwrapErr()).toEqual(new MissingTopicError())
    })
  })

  describe('createTopic', () => {
    it('creates a topic', async () => {
      const attributes = {
        name: 'test topic',
        description: 'test description',
        parentId: null,
        agencyId: mockAgency.id,
      }
      const newTopic = await topicService.createTopic(attributes)
      expect(newTopic._unsafeUnwrap()).toMatchObject(attributes)
    })
  })

  describe('updateTopicById', () => {
    it('updates a topic', async () => {
      const attributes = {
        id: mockTopic1.id,
        name: 'test topic',
        description: 'test description',
        parentId: null,
      }
      const updateCount = await topicService.updateTopicById(attributes)
      const updatedTopic = await Topic.findByPk(mockTopic1.id)
      expect(updateCount._unsafeUnwrap()).toBe(1)
      expect(updatedTopic).toMatchObject(attributes)
    })
  })

  describe('deleteTopicById', () => {
    it('deletes a topic', async () => {
      const deleteCount = await topicService.deleteTopicById(mockTopic1.id)
      const deletedTopic = await Topic.findByPk(mockTopic1.id)
      expect(deleteCount._unsafeUnwrap()).toBe(1)
      expect(deletedTopic).toBeNull()
    })
  })
})

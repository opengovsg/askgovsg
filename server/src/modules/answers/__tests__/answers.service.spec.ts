import { ResponseError } from '@opensearch-project/opensearch/lib/errors'
import { StatusCodes } from 'http-status-codes'
import { errAsync, okAsync } from 'neverthrow'
import { Sequelize } from 'sequelize'
import {
  Agency,
  Answer,
  Post,
  PostStatus,
  Topic,
  User,
} from '~shared/types/base'
import { PostCreation } from '../../../models/posts.model'
import { ModelDef } from '../../../types/sequelize'
import {
  createTestDatabase,
  getModelDef,
  ModelName,
} from '../../../util/jest-db'
import { AnswersService } from '../answers.service'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { errors } = require('@opensearch-project/opensearch')

describe('AnswersService', () => {
  let agency: Agency
  let topic: Topic
  let user: User
  let post: Post
  let answer: Answer

  let db: Sequelize
  let Post: ModelDef<Post, PostCreation>
  let Answer: ModelDef<Answer>
  let service: AnswersService

  const searchSyncService = {
    createPost: jest.fn(),
    updatePost: jest.fn(),
  }

  beforeAll(async () => {
    db = await createTestDatabase()
    Post = getModelDef<Post, PostCreation>(db, ModelName.Post)
    Answer = getModelDef<Answer>(db, ModelName.Answer)
    service = new AnswersService({
      Post,
      Answer,
      searchSyncService,
      sequelize: db,
    })

    const Agency = getModelDef<Agency>(db, ModelName.Agency)
    agency = await Agency.create({
      shortname: 'was',
      longname: 'Work Allocation Singapore',
      email: 'enquiries@was.gov.sg',
      logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
      noEnquiriesMessage: null,
      website: null,
      displayOrder: null,
    })

    const User = getModelDef<User>(db, ModelName.User)
    user = await User.create({
      username: 'enquiries@was.gov.sg',
      displayname: 'Enquiries @ WAS',
      views: 0,
      agencyId: agency.id,
    })

    const Topic = getModelDef<Topic>(db, ModelName.Topic)
    topic = await Topic.create({
      agencyId: agency.id,
      name: 'Post Topic',
      description: null,
      parentId: null,
    })
  })

  beforeEach(async () => {
    await Post.destroy({ truncate: true })
    await Answer.destroy({ truncate: true })
    post = await Post.create({
      title: 'Post',
      description: null,
      agencyId: agency.id,
      userId: user.id,
      topicId: topic.id,
      status: PostStatus.Private,
    })
    answer = await Answer.create({
      body: 'Answer Body',
      userId: user.id,
      postId: post.id,
    })
  })

  afterAll(async () => {
    await db.close()
  })

  describe('listAnswers', () => {
    it('returns only answers associated with specified id', async () => {
      const otherPost = await Post.create({
        title: 'Other Post',
        description: null,
        agencyId: agency.id,
        userId: user.id,
        topicId: topic.id,
        status: PostStatus.Private,
      })
      const otherAnswer = await Answer.create({
        body: 'Other Answer Body',
        userId: user.id,
        postId: otherPost.id,
      })

      const answers = await service.listAnswers(post.id)

      expect(answers.length).toEqual(1)
      expect(answers.some((a) => a.id === answer.id)).toBe(true)
      expect(answers.some((a) => a.id === otherAnswer.id)).toBe(false)
    })
  })

  describe('createAnswer', () => {
    it('creates an answer for the given postId', async () => {
      const body = 'Second Answer Body'
      const attributes = {
        body,
        postId: post.id,
        userId: user.id,
      }

      searchSyncService.updatePost.mockResolvedValue(okAsync({}))

      const answerId = await service.createAnswer(attributes)
      const answer = await Answer.findByPk(answerId)

      const updatedPost = await Post.findByPk(post.id)

      expect(answer).toMatchObject(attributes)
      expect(updatedPost?.status).toEqual(PostStatus.Public)
    })

    it('throws and rollbacks transaction if sync with opensearch index fails', async () => {
      const answersCountBefore = await Answer.count()

      const body = 'Second Answer Body'
      const attributes = {
        body,
        postId: post.id,
        userId: user.id,
      }

      searchSyncService.updatePost.mockResolvedValue(
        errAsync(
          new errors.ResponseError({
            body: { errors: {}, status: StatusCodes.BAD_REQUEST },
            statusCode: StatusCodes.BAD_REQUEST,
          }),
        ),
      )

      await expect(service.createAnswer(attributes)).rejects.toBeInstanceOf(
        ResponseError,
      )

      const answersCountAfter = await Answer.count()

      expect(answersCountAfter).toBe(answersCountBefore)
    })
  })

  describe('updateAnswer', () => {
    it('updates the body of the answer', async () => {
      const body = 'Second Answer Body'

      searchSyncService.updatePost.mockResolvedValue(okAsync({}))

      const updateCount = await service.updateAnswer({
        id: answer.id,
        body,
      })

      const updatedAnswer = await Answer.findByPk(answer.id)

      expect(updateCount).toBe(1)
      expect(updatedAnswer?.body).toEqual(body)
    })

    it('throws and rollbacks transaction if sync with opensearch index fails', async () => {
      const answersCountBefore = await Answer.count()

      const body = 'Second Answer Body'

      searchSyncService.updatePost.mockResolvedValue(
        errAsync(
          new errors.ResponseError({
            body: { errors: {}, status: StatusCodes.BAD_REQUEST },
            statusCode: StatusCodes.BAD_REQUEST,
          }),
        ),
      )

      await expect(
        service.updateAnswer({
          id: answer.id,
          body,
        }),
      ).rejects.toBeInstanceOf(ResponseError)

      const answersCountAfter = await Answer.count()

      expect(answersCountAfter).toBe(answersCountBefore)
    })
  })

  describe('deleteAnswer', () => {
    it('deletes the specified answer', async () => {
      await service.deleteAnswer(answer.id)

      const deletedAnswer = await Answer.findByPk(answer.id)

      expect(deletedAnswer).toBeNull()
    })
  })
})

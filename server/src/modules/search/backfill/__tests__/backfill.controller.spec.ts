import { ResponseError } from '@opensearch-project/opensearch/lib/errors'
import { StatusCodes } from 'http-status-codes'
import { errAsync, okAsync } from 'neverthrow'
import { PostStatus } from '../../../../../../shared/src/types/base'
import { DatabaseError } from '../../../core/core.errors'
import { InvalidTopicsError } from '../../../post/post.errors'
import { BackfillController } from '../backfill.controller'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { errors } = require('@opensearch-project/opensearch')

describe('BackfillSearchController', () => {
  const indexName = 'search_entries'

  const answersService = {
    listAnswers: jest.fn(),
  }
  const postService = {
    listPosts: jest.fn(),
  }
  const searchService = {
    indexAllData: jest.fn(),
    searchPosts: jest.fn(),
  }

  const searchController = new BackfillController({
    answersService,
    postService,
    searchService,
  })

  const noOfItems = 2
  const mockPosts = []

  for (let i = 1; i <= noOfItems; i++) {
    mockPosts.push({
      title: `title ${i}`,
      views: 0,
      status: PostStatus.Public,
      userId: i,
      agencyId: i,
      topicId: i,
      id: i,
    })
  }

  const mockListPostsValue = {
    posts: mockPosts,
    totalItems: noOfItems,
  }

  const mockReturnItems: { index: { _index: string; status: StatusCodes } }[] =
    []
  for (let i = 1; i <= noOfItems; i++) {
    mockReturnItems.push({
      index: {
        _index: indexName,
        status: StatusCodes.CREATED,
      },
    })
  }

  describe('indexAllData', () => {
    it('returns OK on a valid query', async () => {
      postService.listPosts.mockResolvedValue(mockListPostsValue)
      answersService.listAnswers.mockImplementation((postId) =>
        Promise.resolve([
          { body: `<p>answer ${postId}</p>` },
          { body: `<p>another answer ${postId}</p>` },
        ]),
      )
      searchService.indexAllData.mockReturnValue(
        okAsync({
          errors: false,
          items: mockReturnItems,
        }),
      )

      const response = await searchController.indexAllData(indexName)

      expect(response.isOk()).toBeTruthy()
      if (response.isOk()) {
        // TODO: Proper typing to remove JSON parse and stringify
        const responseValue = JSON.parse(JSON.stringify(response.value))
        expect(responseValue.errors).toBeFalsy()
        for (const item of responseValue.items) {
          for (const key in item) {
            expect(item[key].status).toBe(StatusCodes.CREATED)
            expect(item[key]._index).toBe(indexName)
          }
        }
      }
    })

    it('returns InvalidTopicsError when postService.listPosts throws InvalidTopicsError', async () => {
      postService.listPosts.mockRejectedValue(new InvalidTopicsError())

      const response = await searchController.indexAllData(indexName)

      expect(response.isErr()).toBeTruthy()
      if (response.isErr()) {
        expect(response.error).toStrictEqual(new InvalidTopicsError())
      }
    })

    it('returns Database Error when listAnswers throws Database Error', async () => {
      postService.listPosts.mockResolvedValue(mockListPostsValue)
      answersService.listAnswers.mockRejectedValue(new DatabaseError())

      const response = await searchController.indexAllData(indexName)

      // expect(response).toBe('')
      expect(response.isErr()).toBeTruthy()
      if (response.isErr()) {
        expect(response.error).toStrictEqual(new DatabaseError())
      }
    })

    it('returns Response Error when searchService.indexAllData throws Response Error', async () => {
      postService.listPosts.mockResolvedValue(mockListPostsValue)
      answersService.listAnswers.mockImplementation((postId) =>
        Promise.resolve([
          { body: `<p>answer ${postId}</p>` },
          { body: `<p>another answer ${postId}</p>` },
        ]),
      )
      searchService.indexAllData.mockReturnValue(
        errAsync(
          new errors.ResponseError({
            body: { errors: {}, status: StatusCodes.BAD_REQUEST },
            statusCode: StatusCodes.BAD_REQUEST,
          }),
        ),
      )

      const response = await searchController.indexAllData(indexName)
      expect(response.isErr()).toBeTruthy()
      if (response.isErr()) {
        expect(response.error).toBeInstanceOf(ResponseError)
      }
    })

    afterEach(() => {
      jest.resetAllMocks()
    })
  })
})

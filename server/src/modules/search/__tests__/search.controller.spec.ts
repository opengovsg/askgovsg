import { SearchHit } from '@opensearch-project/opensearch/api/types'
import express from 'express'
import { query } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { errAsync, okAsync } from 'neverthrow'
import supertest from 'supertest'
import { SearchEntryWithHighlight } from '../../../../../shared/src/types/api'
import { PostStatus } from '../../../../../shared/src/types/base'
import { SearchController } from '../search.controller'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { errors } = require('@opensearch-project/opensearch')

describe('SearchController', () => {
  const indexName = 'search_entries'

  const searchService = {
    searchPosts: jest.fn(),
    indexPost: jest.fn(),
  }

  const searchController = new SearchController({
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

  describe('searchPosts', () => {
    const searchEntries: SearchEntryWithHighlight[] = [
      {
        result: {
          agencyId: 2,
          answers: ['answer 2000'],
          description: 'description 200',
          postId: 2,
          title: 'title 20',
          topicId: null,
        },
        highlight: {
          title: ['<b>title</b> 20'],
        },
      },
      {
        result: {
          agencyId: 1,
          answers: ['answer 1000'],
          description: 'description 100',
          postId: 1,
          title: 'title 10',
          topicId: null,
        },
        highlight: {
          title: ['<b>title</b> 10'],
        },
      },
    ]
    const sampleHits: SearchHit[] = searchEntries.map((entry) => {
      return {
        _id: `${entry.result.postId}`,
        _index: indexName,
        _score: 0.5,
        _source: entry.result,
        _type: '_doc',
        highlight: entry.highlight,
      }
    })
    const sampleSearchPostsResponse = {
      body: {
        _shards: { failed: 0, skipped: 0, successful: 1, total: 1 },
        hits: {
          hits: sampleHits,
          max_score: 0.8754687,
          total: { relation: 'eq', value: 2 },
        },
        timed_out: false,
        took: 10,
      },
      headers: {
        'content-length': '598',
        'content-type': 'application/json; charset=UTF-8',
      },
      meta: {
        aborted: false,
        attempts: 0,
        connection: {
          _openRequests: 0,
          deadCount: 0,
          headers: {},
          id: 'https://localhost:9200/',
          resurrectTimeout: 0,
          roles: { data: true, ingest: true, master: true },
          status: 'alive',
          url: 'https://localhost:9200/',
        },
        context: null,
        name: 'opensearch-js',
        request: {
          id: 3,
          options: {},
          params: {
            body: '{{ "query": { "multi_match": { "query": "title", "fields": ["title", "description", "answers"], "type": "most_fields", "zero_terms_query": "all", "fuzziness": "AUTO" } }, "highlight": { "fields": { "title": {}, "description": {}, "answers": {} }, "pre_tags": "<b>", "post_tags": "</b>", "fragment_size": 200 } }}',
            headers: {
              'content-length': '153',
              'content-type': 'application/json',
              'user-agent':
                'opensearch-js/1.0.0 (darwin 21.1.0-x64; Node.js v14.17.6)',
            },
            method: 'POST',
            path: '/search_entries/_search',
            querystring: '',
            timeout: 30000,
          },
        },
      },
      statusCode: 200,
    }

    it('returns OK on a valid query', async () => {
      searchService.searchPosts.mockReturnValue(
        okAsync(sampleSearchPostsResponse),
      )

      const agencyId = 1
      const searchQuery = 'title'

      const app = express()
      app.get(
        '/search',
        [query('agencyId').isInt().toInt(), query('query').isString().trim()],
        searchController.searchPosts,
      )
      const request = supertest(app)
      const response = await request.get(
        `/search?agencyId=${agencyId}&query=${searchQuery}`,
      )

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(searchEntries)
    })

    it('returns Bad Request Error when agencyId is not an integer', async () => {
      const app = express()
      app.get(
        '/search',
        [query('agencyId').isInt().toInt(), query('query').isString().trim()],
        searchController.searchPosts,
      )
      const request = supertest(app)
      const response = await request.get(
        '/search?agencyId=string&query=searchQuery',
      )

      expect(response.status).toEqual(StatusCodes.BAD_REQUEST)
      expect(response.body).toEqual({
        message: 'Bad Request Error - query does not pass validation checks',
      })
    })

    it('returns Internal Server Error when searchService.searchPosts throws Error', async () => {
      const mockedResponseError = new errors.ResponseError({
        body: { errors: {}, status: StatusCodes.BAD_REQUEST },
        statusCode: StatusCodes.BAD_REQUEST,
      })
      searchService.searchPosts.mockReturnValue(errAsync(mockedResponseError))

      const app = express()
      app.get(
        '/search',
        [query('agencyId').isInt().toInt(), query('query').isString().trim()],
        searchController.searchPosts,
      )
      const request = supertest(app)
      const response = await request.get(`/search?agencyId=1&query=searchQuery`)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toEqual(
        JSON.parse(JSON.stringify(mockedResponseError)),
      )
    })

    afterEach(() => {
      jest.resetAllMocks()
    })
  })
})

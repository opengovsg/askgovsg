import { SearchHit } from '@opensearch-project/opensearch/api/types'
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { okAsync } from 'neverthrow'
import supertest from 'supertest'
import { SearchEntry } from '../../../../../shared/src/types/api'
import { SearchController } from '../search.controller'
import { routeSearch } from '../search.routes'

describe('/', () => {
  describe('GET /', () => {
    const path = '/'

    const searchService = {
      searchPosts: jest.fn(),
      indexPost: jest.fn(),
    }

    const controller = new SearchController({
      searchService,
    })
    const router = routeSearch({ controller })
    const indexName = 'search_entries'

    const searchEntries: SearchEntry[] = [
      {
        agencyId: 2,
        answers: ['answer 2000'],
        description: 'description 200',
        postId: 2,
        title: 'title 20',
        topicId: null,
      },
      {
        agencyId: 1,
        answers: ['answer 1000'],
        description: 'description 100',
        postId: 1,
        title: 'title 10',
        topicId: null,
      },
    ]
    const sampleHits: SearchHit[] = searchEntries.map((entry) => {
      return {
        _id: `${entry.postId}`,
        _index: indexName,
        _score: 0.125,
        _source: entry,
        _type: '_doc',
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
      statusCode: 200,
    }
    it('returns OK on valid query', async () => {
      const app = express()
      app.use(path, router)
      const request = supertest(app)

      searchService.searchPosts.mockReturnValue(
        okAsync(sampleSearchPostsResponse),
      )

      const response = await request.get(path).query({ query: 'test' })

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(searchEntries)
    })

    it('returns BAD REQUEST on invalid agencyId format', async () => {
      const app = express()
      app.use(path, router)
      const request = supertest(app)

      searchService.searchPosts.mockReturnValue(
        okAsync(sampleSearchPostsResponse),
      )

      const response = await request
        .get(path)
        .query({ agencyId: 'test', query: 'test search' })

      expect(response.status).toEqual(StatusCodes.BAD_REQUEST)
      expect(response.body).toStrictEqual({
        message: 'Bad Request Error - query does not pass validation checks',
      })
    })

    it('uses trimmed search query to search posts', async () => {
      const app = express()
      app.use(path, router)
      const request = supertest(app)

      searchService.searchPosts.mockReturnValue(
        okAsync(sampleSearchPostsResponse),
      )

      const trimmedSearch = 'test search'
      const response = await request
        .get(path)
        .query({ query: ` ${trimmedSearch}      ` })

      expect(response.status).toEqual(StatusCodes.OK)
      expect(searchService.searchPosts).toHaveBeenCalledWith(
        indexName,
        trimmedSearch,
        undefined,
      )
    })
  })
})

import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { okAsync } from 'neverthrow'
import supertest from 'supertest'
import { SearchController } from '../search.controller'
import { routeSearch } from '../search.routes'

describe('/search', () => {
  describe('GET /search', () => {
    const path = '/search'

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

    const controller = new SearchController({
      answersService,
      postService,
      searchService,
    })
    const router = routeSearch({ controller })

    const sampleHits = [
      {
        _id: 'm42WIn0BbFqfMhuFmmR4',
        _index: 'search_entries',
        _score: 0.8754687,
        _source: {
          agencyId: 2,
          answer: 'answer 2000',
          description: 'description 200',
          postId: 2,
          title: 'title 20',
          topicId: null,
        },
        _type: '_doc',
      },
      {
        _id: 'mo2WIn0BbFqfMhuFmmR4',
        _index: 'search_entries',
        _score: 0.18232156,
        _source: {
          agencyId: 1,
          answer: 'answer 1000',
          description: 'description 100',
          postId: 1,
          title: 'title 10',
          topicId: null,
        },
        _type: '_doc',
      },
    ]
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
      app.use(router)
      const request = supertest(app)

      searchService.searchPosts.mockReturnValue(
        okAsync(sampleSearchPostsResponse),
      )

      const response = await request.get(path).query({ query: 'test' })

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(sampleHits)
    })

    it('returns BAD REQUEST on invalid agencyId format', async () => {
      const app = express()
      app.use(router)
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
      const path = '/search'
      const app = express()
      app.use(router)
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
        'search_entries',
        trimmedSearch,
        undefined,
      )
    })
  })
})

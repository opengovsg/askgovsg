import { ResponseError } from '@opensearch-project/opensearch/lib/errors'
import { StatusCodes } from 'http-status-codes'
import { SearchEntry } from '~shared/types/api/search'
import { Mocker } from '../opensearch-mock'
import { SearchService } from '../search.service'

// // Uncomment to test with live opensearch service
// import { baseConfig, Environment } from '../../../bootstrap/config/base'
// import { searchConfig } from '../../../bootstrap/config/search'
// import { Client } from '@opensearch-project/opensearch'
// import fs from 'fs'

// Comment when testing with live opensearch service
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client, errors } = require('@opensearch-project/opensearch')

describe('Search Service', () => {
  // // Uncomment to test with live opensearch service
  // const host = searchConfig.host
  // const protocol = 'https'
  // const port = searchConfig.port
  // const auth = `${searchConfig.username}:${encodeURIComponent(
  //   searchConfig.password,
  // )}`
  // let connectionOptions
  // if (baseConfig.nodeEnv === Environment.Dev) {
  //   connectionOptions = { rejectUnauthorized: false } // Turn off certificate verification (rejectUnauthorized: false)
  // } else {
  //   connectionOptions = {
  //     ca: fs.readFileSync('/etc/ssl/certs/ca-certificates.crt'),
  //   }
  // }
  // const client = new Client({
  //   node: protocol + '://' + auth + '@' + host + ':' + port,
  //   ssl: connectionOptions,
  // })

  // Comment when testing with live opensearch service
  const host = 'localhost'
  const protocol = 'https'
  const port = 9200
  const auth = 'admin:admin'
  const mock = new Mocker()
  const client = new Client({
    node: protocol + '://' + auth + '@' + host + ':' + port,
    Connection: mock.getConnection(),
  })

  const searchService: SearchService = new SearchService({
    client,
  })

  const indexName = 'search_entries'

  const searchEntriesDataset: SearchEntry[] = []

  for (let i = 1; i < 3; i++) {
    searchEntriesDataset.push({
      title: `title ${i * 10}`,
      description: `description ${i * 100}`,
      answers: [`answer ${i * 1000}`],
      agencyId: i,
      postId: i,
      topicId: null,
    })
  }

  describe('searchPosts', () => {
    // // Uncomment if testing with live opensearch service
    // beforeAll(async () => {
    //   await searchService.indexAllData(indexName, searchEntriesDataset)
    // })

    it('should successfully search index based on query when a keyword in one of the fields is mentioned', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'POST',
          path: `/${indexName}/_search`,
        },
        () => {
          return {
            hits: {
              total: { value: 2, relation: 'eq' },
              hits: [{}, {}],
            },
          }
        },
      )

      const searchValue = 'answerr'
      const response = await searchService.searchPosts(indexName, searchValue)
      expect(response.isOk()).toBeTruthy()
      if (response.isOk()) {
        expect(response.value.statusCode).toBe(StatusCodes.OK)
        expect(response.value.body.hits.total.value).toBeGreaterThan(0)
        expect(response.value.body.hits.hits.length).toBeGreaterThan(0)
      }
    })

    it('should successfully search index based on query when a keyword is missing a letter', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'POST',
          path: `/${indexName}/_search`,
        },
        () => {
          return {
            hits: {
              total: { value: 2, relation: 'eq' },
              hits: [{}, {}],
            },
          }
        },
      )

      const searchValue = 'descriptio'
      const response = await searchService.searchPosts(indexName, searchValue)
      expect(response.isOk()).toBeTruthy()
      if (response.isOk()) {
        expect(response.value.statusCode).toBe(StatusCodes.OK)
        expect(response.value.body.hits.total.value).toBeGreaterThan(0)
        expect(response.value.body.hits.hits.length).toBeGreaterThan(0)
      }
    })

    it('should successfully search index based on query when characters are transposed', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'POST',
          path: `/${indexName}/_search`,
        },
        () => {
          return {
            hits: {
              total: { value: 2, relation: 'eq' },
              hits: [{}, {}],
            },
          }
        },
      )

      const searchValue = 'descripiton'
      const response = await searchService.searchPosts(indexName, searchValue)
      expect(response.isOk()).toBeTruthy()
      if (response.isOk()) {
        expect(response.value.statusCode).toBe(StatusCodes.OK)
        expect(response.value.body.hits.hits.length).toBeGreaterThan(0)
      }
    })

    it('should rank hits based on relevance', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'POST',
          path: `/${indexName}/_search`,
        },
        () => {
          return {
            hits: {
              total: { value: 2, relation: 'eq' },
              hits: [
                {
                  _index: indexName,
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
                  _index: indexName,
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
              ],
            },
          }
        },
      )

      const searchValue = 'title 20'
      const response = await searchService.searchPosts(indexName, searchValue)
      expect(response.isOk()).toBeTruthy()
      if (response.isOk()) {
        expect(response.value.statusCode).toBe(StatusCodes.OK)
        expect(response.value.body.hits.total.value).toBeGreaterThan(0)
        expect(response.value.body.hits.hits.length).toBeGreaterThan(0)
        expect(response.value.body.hits.hits[0]._source.postId).toBe(2)
      }
    })

    it('should be able to filter search by agency', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'POST',
          path: `/${indexName}/_search`,
        },
        () => {
          return {
            hits: {
              total: { value: 1, relation: 'eq' },
              hits: [
                {
                  _source: {
                    agencyId: 1,
                  },
                },
              ],
            },
          }
        },
      )

      const searchValue = 'answer'
      const agencyId = 1
      const response = await searchService.searchPosts(
        indexName,
        searchValue,
        agencyId,
      )

      expect(response.isOk()).toBeTruthy()
      if (response.isOk()) {
        expect(response.value.statusCode).toBe(StatusCodes.OK)
        expect(response.value.body.hits.total.value).toBe(1)
        expect(response.value.body.hits.hits.length).toBe(1)
        expect(response.value.body.hits.hits[0]._source.agencyId).toBe(agencyId)
      }
    })

    it('throws NOT FOUND error if client.search does not succeed because index does not exist', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'POST',
          path: '/indexName/_search',
        },
        () => {
          return new errors.ResponseError({
            body: { errors: {}, status: StatusCodes.NOT_FOUND },
            statusCode: StatusCodes.NOT_FOUND,
          })
        },
      )

      const searchValue = 'title'
      const response = await searchService.searchPosts(
        'indexName', // non-existent index name causes error
        searchValue,
      )
      expect(response.isErr()).toBeTruthy()
      if (response.isErr()) {
        expect(response.error.statusCode).toBe(StatusCodes.NOT_FOUND)
        expect(response.error).toBeInstanceOf(ResponseError)
      }
    })

    // Comment when testing with live opensearch service
    afterEach(async () => {
      mock.clearAll()
    })

    // // Uncomment if testing with live opensearch service
    // afterAll(async () => {
    //   await client.indices.delete({
    //     index: indexName,
    //   })
    // })
  })
})
